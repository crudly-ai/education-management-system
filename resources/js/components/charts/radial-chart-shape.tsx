import { RadialBar, RadialBarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/layout/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

const chartData = [
  { name: "Desktop", value: 1260, fill: "var(--color-desktop)" },
  { name: "Mobile", value: 570, fill: "var(--color-mobile)" },
  { name: "Tablet", value: 190, fill: "var(--color-tablet)" },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
  tablet: {
    label: "Tablet",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export function RadialChartShape() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Radial Chart - Shape</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={90}
            endAngle={450}
            innerRadius={30}
            outerRadius={110}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey="value" background cornerRadius={10} />
            <PolarAngleAxis type="number" domain={[0, 100]} className="fill-none stroke-none" />
            <PolarRadiusAxis tick={false} tickCount={2} axisLine={false} className="fill-none stroke-none" />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}