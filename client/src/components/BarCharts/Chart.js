import React, { PureComponent } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default class Chart extends PureComponent {

  render() {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={300}
          data={this.props.chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          barSize={20}
          barGap={2}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="strikePrice" />
          <YAxis/>
          <Tooltip />
          <Legend />
          <Bar dataKey="CE" fill="#8884d8" />
          <Bar dataKey="PE" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    );
  }
}