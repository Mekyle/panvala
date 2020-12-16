import { makeStyles, Box, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@material-ui/core';
import { Info } from '@material-ui/icons';
import { useRouter } from 'next/router'
import { Legend, LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { communitiesBySlug } from '../communities';
import BaseLayout from "../layout";
import { getCommunitySubsidyChartData } from '../lib/calculations';
import { getSpreadsheetData } from '../lib/static';

export async function getStaticProps(content) {
  return { props: await getSpreadsheetData() };
}

export async function getStaticPaths() {
  return {
    paths: Object.keys(communitiesBySlug).map(slug => { return { params: { slug } }; }),
    fallback: false,
  };
}

const useStyles = makeStyles((theme) => ({
  button: {
    color: "white",
  },
  gridItemPaper: {
    minHeight: 300,
    padding: theme.spacing(4),
  },
}));

export default function Community({ scoreboard, totals }) {
  const classes = useStyles();
  const { slug } = useRouter().query;
  const communityInfo = communitiesBySlug[slug];
  const subsidyChartData = getCommunitySubsidyChartData(communityInfo.name, scoreboard, totals);

  return (
    <BaseLayout>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Paper className={classes.gridItemPaper}>
            <Typography variant="h1" gutterBottom>{communityInfo.name}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper className={classes.gridItemPaper}>
            <Typography component="h1" variant="h4" gutterBottom>Staking Yield Curves</Typography>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={subsidyChartData}>
                  <XAxis type="number" dataKey="stakedAmount" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line yAxisId="left" connectNulls={true} dataKey="subsidy" name="Matching PAN" key="subsidy" />
                  <Line yAxisId="right" connectNulls={true} dataKey="yield" name="Yield (APY)" stroke="#888888" key="yield" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <Typography variant="caption" display="block">
              The X-axis is the amount of PAN staked by each community. The Y-axis is the matching PAN each community
              can earn this quarter.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </BaseLayout>
  );
};
