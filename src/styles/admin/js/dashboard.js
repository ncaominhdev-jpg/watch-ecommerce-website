export const getProfitChartOptions = (monthlyRevenue = []) => {
   const labels = monthlyRevenue.map(item => item.month);  
  const revenues = monthlyRevenue.map(item => parseInt(item.revenue));  

  return {
    series: [
      {
        name: "Doanh thu theo tháng",
        data: revenues,
      },
    ],
    chart: {
      type: "bar",
      height: 345,
      offsetX: -15,
      toolbar: { show: true },
      foreColor: "#adb0bb",
      fontFamily: "inherit",
      sparkline: { enabled: false },
    },
    colors: ["#5D87FF"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "7%",
        borderRadius: [6],
        borderRadiusApplication: "end",
        borderRadiusWhenStacked: "all",
      },
    },
    markers: { size: 0 },
    dataLabels: { enabled: false },
    legend: { show: false },
    grid: {
      borderColor: "rgba(0,0,0,0.1)",
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
    },
    xaxis: {
      type: "category",
      categories: labels.length > 0 ? labels : ["Không có dữ liệu"],
      labels: { style: { cssClass: "grey--text lighten-2--text fill-color" } },
    },
    yaxis: {
      show: true,
      min: 0,
      max:
        revenues.length > 0
          ? Math.ceil(Math.max(...revenues) / 1000000) * 1000000 + 500000
          : 400,
      tickAmount: 4,
      labels: {
        formatter: (value) =>
          new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
          }).format(value),
        style: { cssClass: "grey--text lighten-2--text fill-color" },
      },
    },
    stroke: {
      show: true,
      width: 3,
      lineCap: "butt",
      colors: ["transparent"],
    },
    tooltip: {
      theme: "light",
      y: {
        formatter: (value) =>
          new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
          }).format(value),
      },
    },
    responsive: [
      {
        breakpoint: 600,
        options: {
          plotOptions: { bar: { borderRadius: 3 } },
        },
      },
    ],
  };
};
