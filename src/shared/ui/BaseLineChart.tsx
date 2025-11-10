import ApexCharts from 'apexcharts'
import {createEffect, createMemo, onCleanup, type JSX} from 'solid-js'

export type XYPoint = {x: number; y: number}
export type Series = {name: string; data: XYPoint[]}

type Props = {
  series: Series[]
  height?: number | string
  class?: string
  overrides?: Partial<ApexCharts.ApexOptions>
}

export const BaseLineChart = (p: Props): JSX.Element => {
  let container!: HTMLDivElement
  let chart: ApexCharts | null = null

  const series = () => p.series

  const options = createMemo<ApexCharts.ApexOptions>(() => {
    const baseOptions: ApexCharts.ApexOptions = {
      chart: {
        type: 'line',
        height: '100%',
        parentHeightOffset: 0,
        toolbar: {show: false},
        zoom: {enabled: false},
        animations: {
          enabled: true,
          speed: 800,
          animateGradually: {enabled: true, delay: 100},
        },
        background: 'transparent',
        foreColor: 'currentColor',
      },

      grid: {show: true, borderColor: 'var(--color-row-1)'},
      legend: {show: false},
      dataLabels: {enabled: false},
      stroke: {curve: 'smooth', width: 4},
      markers: {size: 0},
      colors: ['var(--color-accent)'],

      xaxis: {
        type: 'datetime',
        tickAmount: 4,
        labels: {
          rotate: 0,
          datetimeUTC: false,
          datetimeFormatter: {year: 'yyyy', month: 'MMM yy', day: 'dd MMM'},
          style: {fontFamily: 'inherit', fontSize: '11px', colors: 'var(--color-text-dim)'},
        },
        axisTicks: {show: false},
        axisBorder: {show: false},
        crosshairs: {show: false},
        tooltip: {enabled: false},
      },

      yaxis: {show: false},

      tooltip: {
        shared: true,
        intersect: false,
        x: {format: 'dd MMM yyyy'},
        y: {formatter: (v: number) => (v ?? 0).toLocaleString()},
        marker: {show: true, fillColors: ['var(--color-accent)']},
        style: {fontFamily: 'inherit'},
      },

      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          gradientToColors: ['#8b6acb'],
          type: 'horizontal',
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 100],
        },
      },

      theme: {mode: 'dark'},
    }

    return p.overrides ? {...baseOptions, ...p.overrides} : baseOptions
  })

  const widgetHeight = createMemo(() =>
    typeof p.height === 'number' ? `${p.height}px` : (p.height ?? '100%'),
  )

  const renderChart = () => {
    if (typeof window === 'undefined') return
    if (!container) return
    if (chart) {
      chart.destroy()
      chart = null
    }
    chart = new ApexCharts(container, {
      ...options(),
      series: series(),
    })
    chart.render()
  }

  createEffect(() => {
    const nextSeries = series()
    const nextOptions = options()
    if (!chart) {
      renderChart()
      return
    }
    chart.updateOptions(nextOptions, false, true)
    chart.updateSeries(nextSeries, true)
  })

  onCleanup(() => {
    if (chart) {
      chart.destroy()
      chart = null
    }
  })

  return (
    <div
      ref={container}
      class={p.class}
      style={{height: widgetHeight(), width: '100%'}}
    />
  )
}
