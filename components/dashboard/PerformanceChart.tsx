'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PerformanceChartProps {
  feedback: {
    proposalMarks: number | null;
    implementationMarks: number | null;
    documentationMarks: number | null;
    presentationMarks: number | null;
    githubMarks: number | null;
  };
}

export default function PerformanceChart({ feedback }: PerformanceChartProps) {
  const data = [
    { name: 'Proposal', marks: feedback.proposalMarks || 0, total: 20, color: '#3b82f6' },
    { name: 'Implementation', marks: feedback.implementationMarks || 0, total: 30, color: '#8b5cf6' },
    { name: 'Documentation', marks: feedback.documentationMarks || 0, total: 20, color: '#10b981' },
    { name: 'Presentation', marks: feedback.presentationMarks || 0, total: 15, color: '#f59e0b' },
    { name: 'GitHub', marks: feedback.githubMarks || 0, total: 15, color: '#ef4444' },
  ];

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Performance Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                      <p className="font-medium">{payload[0].payload.name}</p>
                      <p className="text-sm text-gray-600">
                        Score: {payload[0].value}/{payload[0].payload.total}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="marks" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}