"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/**
 * Interface que define a estrutura de cada ponto do gráfico.
 * Exportamos para que possa ser usada em outros arquivos de lógica/hooks.
 */
export interface ForecastDataPoint {
  time: string; // Ex: "12:00"
  risk: number; // Ex: 45
}

/**
 * Interface para as propriedades do componente ForecastChart.
 */
interface ForecastChartProps {
  data: ForecastDataPoint[];
  color: string;
}

/**
 * ForecastChart: Visualização de análise preditiva tática.
 * * @param data - Array de objetos ForecastDataPoint
 * @param color - Cor hexadecimal para o tema do gráfico
 */
export const ForecastChart = ({ data, color }: ForecastChartProps) => {
  return (
    <div
      className="h-40 w-full bg-zinc-900/20 rounded-lg p-2 border border-zinc-800/30"
      role="img"
      aria-label="Gráfico de previsão de risco tático"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#27272a"
            strokeOpacity={0.2}
          />

          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: "#71717a", fontWeight: 500 }}
            dy={8}
          />

          <YAxis hide domain={[0, 100]} />

          <Tooltip
            cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "4 4" }}
            contentStyle={{
              backgroundColor: "#09090b",
              border: `1px solid ${color}33`,
              borderRadius: "8px",
              fontSize: "10px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
            }}
            itemStyle={{ color: color, fontWeight: "bold" }}
            labelStyle={{ color: "#71717a", marginBottom: "4px" }}
          />

          <Area
            type="monotone"
            dataKey="risk"
            stroke={color}
            strokeWidth={2}
            fill="url(#chartGradient)"
            animationDuration={1500}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
