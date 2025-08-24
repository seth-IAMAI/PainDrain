
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Activity, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { PainEntry } from '@/lib/types';

const MOCK_PAIN_HISTORY: PainEntry[] = [
  { date: '2024-07-21', intensity: 7, bodyPart: 'lower-back', types: ['Dull', 'Aching'], trigger: 'Sitting too long' },
  { date: '2024-07-22', intensity: 5, bodyPart: 'lower-back', types: ['Dull'], trigger: 'Stretching' },
  { date: '2024-07-23', intensity: 8, bodyPart: 'head', types: ['Throbbing'], trigger: 'Stress' },
  { date: '2024-07-24', intensity: 6, bodyPart: 'lower-back', types: ['Aching'], trigger: 'Lifting heavy object' },
  { date: '2024-07-25', intensity: 4, bodyPart: 'head', types: ['Dull'], trigger: 'Medication' },
  { date: '2024-07-26', intensity: 7, bodyPart: 'left-knee', types: ['Sharp', 'Stabbing'], trigger: 'Walking upstairs' },
  { date: '2024-07-27', intensity: 5, bodyPart: 'left-knee', types: ['Aching'], trigger: 'Rest' },
];


const chartConfig = {
  intensity: {
    label: "Pain Intensity",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function PainHistory() {

  const chartData = MOCK_PAIN_HISTORY.map(entry => ({
    date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    intensity: entry.intensity,
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp /> Pain Intensity Over Time
          </CardTitle>
          <CardDescription>
            Your daily logged pain intensity for the last 7 entries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis domain={[0, 10]} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="intensity" fill="var(--color-intensity)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity /> Detailed Pain Log
          </CardTitle>
          <CardDescription>
            A detailed history of your pain entries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><CalendarIcon className="inline-block mr-1 h-4 w-4" />Date</TableHead>
                <TableHead><MapPin className="inline-block mr-1 h-4 w-4" />Body Part</TableHead>
                <TableHead>Intensity</TableHead>
                <TableHead>Pain Types</TableHead>
                <TableHead>Potential Trigger</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_PAIN_HISTORY.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                  <TableCell className="capitalize">{entry.bodyPart.replace('-', ' ')}</TableCell>
                  <TableCell>
                    <Badge variant={entry.intensity > 6 ? 'destructive' : entry.intensity > 3 ? 'secondary' : 'outline'}>
                      {entry.intensity}/10
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {entry.types.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                    </div>
                  </TableCell>
                  <TableCell>{entry.trigger}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
