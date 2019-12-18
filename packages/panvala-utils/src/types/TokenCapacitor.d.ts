/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

import { Contract, ContractTransaction, EventFilter, Signer } from 'ethers';
import { Listener, Provider } from 'ethers/providers';
import { Arrayish, BigNumber, BigNumberish, Interface } from 'ethers/utils';
import { TransactionOverrides, TypedEventDescription, TypedFunctionDescription } from '.';

interface TokenCapacitorInterface extends Interface {
  functions: {
    proposals: TypedFunctionDescription<{ encode([]: [BigNumberish]): string }>;

    parameters: TypedFunctionDescription<{ encode([]: []): string }>;

    lastLockedTime: TypedFunctionDescription<{ encode([]: []): string }>;

    lifetimeReleasedTokens: TypedFunctionDescription<{
      encode([]: []): string;
    }>;

    unlockedBalance: TypedFunctionDescription<{ encode([]: []): string }>;

    lastLockedBalance: TypedFunctionDescription<{ encode([]: []): string }>;

    SCALE: TypedFunctionDescription<{ encode([]: []): string }>;

    token: TypedFunctionDescription<{ encode([]: []): string }>;

    createProposal: TypedFunctionDescription<{
      encode([to, tokens, metadataHash]: [string, BigNumberish, Arrayish]): string;
    }>;

    createManyProposals: TypedFunctionDescription<{
      encode([beneficiaries, tokenAmounts, metadataHashes]: [
        string[],
        BigNumberish[],
        Arrayish[]
      ]): string;
    }>;

    withdrawTokens: TypedFunctionDescription<{
      encode([proposalID]: [BigNumberish]): string;
    }>;

    donate: TypedFunctionDescription<{
      encode([donor, tokens, metadataHash]: [string, BigNumberish, Arrayish]): string;
    }>;

    projectedUnlockedBalance: TypedFunctionDescription<{
      encode([time]: [BigNumberish]): string;
    }>;

    projectedLockedBalance: TypedFunctionDescription<{
      encode([time]: [BigNumberish]): string;
    }>;

    calculateDecay: TypedFunctionDescription<{
      encode([_days]: [BigNumberish]): string;
    }>;

    updateBalances: TypedFunctionDescription<{ encode([]: []): string }>;

    proposalCount: TypedFunctionDescription<{ encode([]: []): string }>;
  };

  events: {
    ProposalCreated: TypedEventDescription<{
      encodeTopics([proposalID, proposer, requestID, recipient, tokens, metadataHash]: [
        null,
        string | null,
        null,
        string | null,
        null,
        null
      ]): string[];
    }>;

    TokensWithdrawn: TypedEventDescription<{
      encodeTopics([proposalID, to, numTokens]: [null, string | null, null]): string[];
    }>;

    BalancesUpdated: TypedEventDescription<{
      encodeTopics([unlockedBalance, lastLockedBalance, lastLockedTime, totalBalance]: [
        null,
        null,
        null,
        null
      ]): string[];
    }>;

    Donation: TypedEventDescription<{
      encodeTopics([payer, donor, numTokens, metadataHash]: [
        string | null,
        string | null,
        null,
        null
      ]): string[];
    }>;
  };
}

export class TokenCapacitor extends Contract {
  connect(signerOrProvider: Signer | Provider | string): TokenCapacitor;
  attach(addressOrName: string): TokenCapacitor;
  deployed(): Promise<TokenCapacitor>;

  on(event: EventFilter | string, listener: Listener): TokenCapacitor;
  once(event: EventFilter | string, listener: Listener): TokenCapacitor;
  addListener(eventName: EventFilter | string, listener: Listener): TokenCapacitor;
  removeAllListeners(eventName: EventFilter | string): TokenCapacitor;
  removeListener(eventName: any, listener: Listener): TokenCapacitor;

  interface: TokenCapacitorInterface;

  functions: {
    proposals(
      arg0: BigNumberish
    ): Promise<{
      gatekeeper: string;
      requestID: BigNumber;
      tokens: BigNumber;
      to: string;
      metadataHash: string;
      withdrawn: boolean;
      0: string;
      1: BigNumber;
      2: BigNumber;
      3: string;
      4: string;
      5: boolean;
    }>;

    parameters(): Promise<string>;

    lastLockedTime(): Promise<BigNumber>;

    lifetimeReleasedTokens(): Promise<BigNumber>;

    unlockedBalance(): Promise<BigNumber>;

    lastLockedBalance(): Promise<BigNumber>;

    SCALE(): Promise<BigNumber>;

    token(): Promise<string>;

    createProposal(
      to: string,
      tokens: BigNumberish,
      metadataHash: Arrayish,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    createManyProposals(
      beneficiaries: string[],
      tokenAmounts: BigNumberish[],
      metadataHashes: Arrayish[],
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    withdrawTokens(
      proposalID: BigNumberish,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    donate(
      donor: string,
      tokens: BigNumberish,
      metadataHash: Arrayish,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    projectedUnlockedBalance(time: BigNumberish): Promise<BigNumber>;

    projectedLockedBalance(time: BigNumberish): Promise<BigNumber>;

    calculateDecay(_days: BigNumberish): Promise<BigNumber>;

    updateBalances(overrides?: TransactionOverrides): Promise<ContractTransaction>;

    proposalCount(): Promise<BigNumber>;
  };

  proposals(
    arg0: BigNumberish
  ): Promise<{
    gatekeeper: string;
    requestID: BigNumber;
    tokens: BigNumber;
    to: string;
    metadataHash: string;
    withdrawn: boolean;
    0: string;
    1: BigNumber;
    2: BigNumber;
    3: string;
    4: string;
    5: boolean;
  }>;

  parameters(): Promise<string>;

  lastLockedTime(): Promise<BigNumber>;

  lifetimeReleasedTokens(): Promise<BigNumber>;

  unlockedBalance(): Promise<BigNumber>;

  lastLockedBalance(): Promise<BigNumber>;

  SCALE(): Promise<BigNumber>;

  token(): Promise<string>;

  createProposal(
    to: string,
    tokens: BigNumberish,
    metadataHash: Arrayish,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  createManyProposals(
    beneficiaries: string[],
    tokenAmounts: BigNumberish[],
    metadataHashes: Arrayish[],
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  withdrawTokens(
    proposalID: BigNumberish,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  donate(
    donor: string,
    tokens: BigNumberish,
    metadataHash: Arrayish,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  projectedUnlockedBalance(time: BigNumberish): Promise<BigNumber>;

  projectedLockedBalance(time: BigNumberish): Promise<BigNumber>;

  calculateDecay(_days: BigNumberish): Promise<BigNumber>;

  updateBalances(overrides?: TransactionOverrides): Promise<ContractTransaction>;

  proposalCount(): Promise<BigNumber>;

  filters: {
    ProposalCreated(
      proposalID: null,
      proposer: string | null,
      requestID: null,
      recipient: string | null,
      tokens: null,
      metadataHash: null
    ): EventFilter;

    TokensWithdrawn(proposalID: null, to: string | null, numTokens: null): EventFilter;

    BalancesUpdated(
      unlockedBalance: null,
      lastLockedBalance: null,
      lastLockedTime: null,
      totalBalance: null
    ): EventFilter;

    Donation(
      payer: string | null,
      donor: string | null,
      numTokens: null,
      metadataHash: null
    ): EventFilter;
  };

  estimate: {
    proposals(arg0: BigNumberish): Promise<BigNumber>;

    parameters(): Promise<BigNumber>;

    lastLockedTime(): Promise<BigNumber>;

    lifetimeReleasedTokens(): Promise<BigNumber>;

    unlockedBalance(): Promise<BigNumber>;

    lastLockedBalance(): Promise<BigNumber>;

    SCALE(): Promise<BigNumber>;

    token(): Promise<BigNumber>;

    createProposal(to: string, tokens: BigNumberish, metadataHash: Arrayish): Promise<BigNumber>;

    createManyProposals(
      beneficiaries: string[],
      tokenAmounts: BigNumberish[],
      metadataHashes: Arrayish[]
    ): Promise<BigNumber>;

    withdrawTokens(proposalID: BigNumberish): Promise<BigNumber>;

    donate(donor: string, tokens: BigNumberish, metadataHash: Arrayish): Promise<BigNumber>;

    projectedUnlockedBalance(time: BigNumberish): Promise<BigNumber>;

    projectedLockedBalance(time: BigNumberish): Promise<BigNumber>;

    calculateDecay(_days: BigNumberish): Promise<BigNumber>;

    updateBalances(): Promise<BigNumber>;

    proposalCount(): Promise<BigNumber>;
  };
}