/* eslint-env mocha */
/* global assert contract */

const utils = require('./utils');


const {
  grantSlateFromProposals,
  BN,
  timing,
  loadDecayMultipliers,
  createMultihash,
  getResource,
} = utils;

const { increaseTime } = utils.evm;

/**
 * Calculate the number of locked tokens
 * @param {Object} multipliers
 * @param {BN} scale
 * @param {BN} startingBalance
 * @param {string} days
 */
function lockedTokens(multipliers, scale, startingBalance, days) {
  const mul = multipliers[days];
  const locked = startingBalance.mul(new BN(mul)).div(scale);
  return locked;
}

contract('integration', (accounts) => {
  const multipliers = loadDecayMultipliers();

  describe('withdraw over time', () => {
    const [creator, recommender] = accounts;

    let gatekeeper;
    let capacitor;
    let token;
    const initialTokens = new BN(100e6);
    let GRANT;
    let scale;
    let snapshotID;
    const initialBalance = new BN(50e6);
    const zero = new BN(0);
    const tokenReleases = utils.loadTokenReleases();
    const daysPerEpoch = 91;

    beforeEach(async () => {
      ({ gatekeeper, token, capacitor } = await utils.newPanvala({ initialTokens, from: creator }));
      snapshotID = await utils.evm.snapshot();
      await utils.chargeCapacitor(capacitor, initialBalance, token, { from: creator });
      // await token.transfer(capacitor.address, initialBalance, { from: creator });

      GRANT = await getResource(gatekeeper, 'GRANT');
      scale = await capacitor.scale();

      // Make sure the recommender has tokens
      const recommenderTokens = '50000000';
      await token.transfer(recommender, recommenderTokens, { from: creator });
      await token.approve(gatekeeper.address, recommenderTokens, { from: recommender });
    });

    it('should calculate withdrawals correctly each epoch with quarterly balance updates', async () => {
      let requestID;
      let slateID;
      let totalRedeemed = zero;

      const runEpoch = async (n) => {
        const epochNumber = new BN(n);
        const epoch = await gatekeeper.currentEpochNumber();
        // console.log('epoch', epochNumber);
        assert.strictEqual(epochNumber.toString(), epoch.toString(), 'Wrong epoch');

        // calculate the locked balance for the start of the next epoch
        // decay from lastLockedBalance
        const nextEpoch = epochNumber.addn(1);
        const lastLockedBalance = await capacitor.lastLockedBalance();
        const futureLockedBalance = lockedTokens(
          multipliers,
          scale,
          lastLockedBalance,
          daysPerEpoch.toString(),
        );

        // Create a grant slate for all the tokens
        // Calculate the number of tokens to request
        const tokens = initialBalance.sub(totalRedeemed).sub(futureLockedBalance);
        const expectedRelease = tokenReleases.quarterly[nextEpoch.toString()];
        assert.strictEqual(
          tokens.toString(),
          expectedRelease.toString(),
          `Wrong release for epoch ${epochNumber.toString()}`,
        );
        // console.log(`requesting ${tokens} tokens`);

        const grantProposals = [{
          to: recommender, tokens, metadataHash: createMultihash('grant'),
        }];

        slateID = await gatekeeper.slateCount();
        requestID = await gatekeeper.requestCount();
        await grantSlateFromProposals({
          gatekeeper,
          proposals: grantProposals,
          capacitor,
          recommender,
          metadata: createMultihash('my slate'),
        });
        await gatekeeper.stakeTokens(slateID, { from: recommender });

        // go to the next epoch and finalize
        await increaseTime(timing.EPOCH_LENGTH);
        assert.strictEqual(
          (await gatekeeper.currentEpochNumber()).toString(),
          nextEpoch.toString(),
        );
        await gatekeeper.countVotes(epochNumber, GRANT);

        // const { unlocked: u, locked: l } = await utils.capacitorBalances(capacitor);
        // console.log('capacitor balances (before withdrawal)', {
        //   unlocked: u.toString(),
        //   locked: l.toString(),
        // });

        // console.log('withdraw', tokens.toString());
        await capacitor.withdrawTokens(requestID, { from: recommender });

        totalRedeemed = await capacitor.lifetimeReleasedTokens();

        const { unlocked, locked } = await utils.capacitorBalances(capacitor);
        // console.log('capacitor balances', {
        //   unlocked: unlocked.toString(),
        //   locked: locked.toString(),
        // });

        assert.strictEqual(
          totalRedeemed
            .add(locked)
            .add(unlocked)
            .toString(),
          initialBalance.toString(),
          `Checksum failed for epoch ${epochNumber.toString()}`,
        );
      };

      const numEpochs = 40;
      const epochs = utils.range(numEpochs).map(i => (() => runEpoch(i)));
      await utils.chain(epochs);
    });

    it('should calculate withdrawals correctly each epoch with daily balance updates', async () => {
      let requestID;
      let slateID;
      let totalRedeemed = zero;

      const runEpoch = async (n) => {
        const epochNumber = new BN(n);
        const epoch = await gatekeeper.currentEpochNumber();
        // console.log('epoch', epochNumber);
        assert.strictEqual(epochNumber.toString(), epoch.toString(), 'Wrong epoch');

        // calculate the locked balance for the start of the next epoch
        const nextEpoch = epochNumber.addn(1);

        // decay from lastLockedBalance
        const lastLockedBalance = await capacitor.lastLockedBalance();

        let futureLockedBalance = lastLockedBalance;
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < daysPerEpoch; i++) {
          futureLockedBalance = lockedTokens(multipliers, scale, futureLockedBalance, '1');
        }

        // Create a grant slate for all the tokens
        // Calculate the number of tokens to request
        const tokens = initialBalance.sub(totalRedeemed).sub(futureLockedBalance);
        const expectedRelease = tokenReleases.daily[nextEpoch.toString()];
        assert.strictEqual(
          tokens.toString(),
          expectedRelease.toString(),
          `Wrong release for epoch ${epochNumber.toString()}`,
        );
        // console.log(`requesting ${tokens} tokens`);

        const grantProposals = [{
          to: recommender, tokens, metadataHash: createMultihash('grant'),
        }];

        slateID = await gatekeeper.slateCount();
        requestID = await gatekeeper.requestCount();
        await grantSlateFromProposals({
          gatekeeper,
          proposals: grantProposals,
          capacitor,
          recommender,
          metadata: createMultihash('my slate'),
        });
        await gatekeeper.stakeTokens(slateID, { from: recommender });

        // go forward one day at a time to the next epoch and call updateBalances
        const updateAndMove = () => increaseTime(timing.ONE_DAY)
          .then(() => capacitor.updateBalances());
        const steps = utils.range(daysPerEpoch).map(() => updateAndMove);
        await utils.chain(steps);

        assert.strictEqual(
          (await gatekeeper.currentEpochNumber()).toString(),
          nextEpoch.toString(),
          'Should have reached the next epoch',
        );
        await gatekeeper.countVotes(epochNumber, GRANT);

        // const { unlocked: u, locked: l } = await utils.capacitorBalances(capacitor);
        // console.log('capacitor balances (before withdrawal)', {
        //   unlocked: u.toString(),
        //   locked: l.toString(),
        // });

        await capacitor.withdrawTokens(requestID, { from: recommender });
        totalRedeemed = await capacitor.lifetimeReleasedTokens();
        // console.log('withdraw', tokens.toString());

        const { unlocked, locked } = await utils.capacitorBalances(capacitor);
        // console.log('capacitor balances', {
        //   unlocked: unlocked.toString(),
        //   locked: locked.toString(),
        // });

        assert.strictEqual(
          totalRedeemed
            .add(locked)
            .add(unlocked)
            .toString(),
          initialBalance.toString(),
          `Checksum failed for epoch ${epochNumber.toString()}`,
        );
      };

      // await capacitor.updateBalances();
      const numEpochs = 16;
      const epochs = utils.range(numEpochs).map(i => (() => runEpoch(i)));
      await utils.chain(epochs);
    });

    afterEach(async () => utils.evm.revert(snapshotID));
  });

  describe('full epoch cycles', () => {
    const [creator, recommender] = accounts;

    let gatekeeper;
    let capacitor;
    let token;
    let parameters;
    const initialTokens = new BN(100e6);
    let GRANT;
    let GOVERNANCE;
    let snapshotID;
    const initialBalance = new BN(50e6);

    beforeEach(async () => {
      ({
        gatekeeper, token, capacitor, parameters,
      } = await utils.newPanvala({ initialTokens, from: creator }));
      snapshotID = await utils.evm.snapshot();
      await utils.chargeCapacitor(capacitor, initialBalance, token, { from: creator });

      GRANT = await getResource(gatekeeper, 'GRANT');
      GOVERNANCE = await getResource(gatekeeper, 'GOVERNANCE');

      // Make sure the recommender has tokens
      const recommenderTokens = '50000000';
      await token.transfer(recommender, recommenderTokens, { from: creator });
      await token.approve(gatekeeper.address, recommenderTokens, { from: recommender });
    });

    it('should run an epoch with multiple contests', async () => {
      // ===== EPOCH 0
      const startingEpoch = await gatekeeper.currentEpochNumber();

      // submit slates
      const key = 'slateStakeAmount';
      const value = '6000';
      const proposals = [{
        key,
        value: utils.abiEncode('uint256', value),
        metadataHash: utils.createMultihash('Smarter and faster gatekeeper'),
      }];

      const governancePermissions = await utils.governanceSlateFromProposals({
        gatekeeper,
        proposals,
        parameterStore: parameters,
        recommender,
        metadata: utils.createMultihash('Important governance'),
      });
      await gatekeeper.stakeTokens(0, { from: recommender });

      const tokens = '1000';
      const grantProposals = [{
        to: recommender, tokens, metadataHash: utils.createMultihash('grant'),
      }];
      const grantPermissions = await utils.grantSlateFromProposals({
        gatekeeper,
        proposals: grantProposals,
        capacitor,
        recommender,
        metadata: utils.createMultihash('Important grant'),
      });
      await gatekeeper.stakeTokens(1, { from: recommender });

      // move forward
      const offset = timing.EPOCH_LENGTH;
      await increaseTime(offset);

      // ===== EPOCH 1
      const secondEpoch = await gatekeeper.currentEpochNumber();
      assert.strictEqual(secondEpoch.toString(), startingEpoch.addn(1).toString(), 'Not in the next epoch');

      // Finalize for both resources
      await gatekeeper.countVotes(startingEpoch, GRANT);
      await gatekeeper.countVotes(startingEpoch, GOVERNANCE);

      // Execute the proposals
      const originalBalance = await token.balanceOf(recommender);
      await Promise.all(governancePermissions.map(r => parameters.setValue(r)));
      await Promise.all(grantPermissions.map(r => capacitor.withdrawTokens(r)));

      const newBalance = await token.balanceOf(recommender);
      assert.strictEqual(newBalance.toString(), originalBalance.add(new BN(tokens)).toString(), 'Tokens not sent');

      const setValue = await parameters.getAsUint(key);
      assert.strictEqual(setValue.toString(), value, 'Stake amount not updated');
    });

    afterEach(async () => utils.evm.revert(snapshotID));
  });
});
