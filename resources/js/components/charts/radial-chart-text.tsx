import { RadialBar, RadialBarChart } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/layout/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

const chartData = [{ visitors: 1260, fill: "var(--color-visitors)" }];

const chartConfig = {
  visitors: {
    label: "Visitors",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function RadialChartText() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Radial Chart - Text</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={0}
            endAngle={250}
            innerRadius={80}
            outerRadius={110}
          >
            <RadialBar
              dataKey="visitors"
              background
              cornerRadius={10}
            />
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground text-4xl font-bold"
            >
              {chartData[0].visitors.toLocaleString()}
            </text>
            <text
              x="50%"
              y="50%"
              dy="2em"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground"
            >
              Visitors
            </text>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}