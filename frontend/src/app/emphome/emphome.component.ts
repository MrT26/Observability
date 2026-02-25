import { Component } from '@angular/core';
import { Chart, ChartData, ChartOptions } from 'chart.js';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-emphome',
  templateUrl: './emphome.component.html',
  styleUrls: ['./emphome.component.css']
})
export class EmphomeComponent {
  transactionData: any;
  public barChartData!: ChartData<'bar'>;
  public barChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
  };
stats:any;
  constructor(private data: DataService) {}

  ngOnInit(): void {
    // Fetch transaction data

    this.data.getStats().subscribe((res:any)=>{
      this.stats=res;
    })

    this.data.getTransactions().subscribe((res: any) => {
      this.transactionData = res;

      // Ensure the data exists and call createBarChart
      if (this.transactionData && this.transactionData.length) {
        this.createBarChart();
      }
    });
  }

  createBarChart(): void {
    // Ensure that transactionData is defined
    if (!this.transactionData) return;
  
    // Create an object to hold cumulative values for each date
    const cumulativeData: { [key: string]: number } = {};
  
    // Group transactions by date and sum the amounts
    this.transactionData.forEach((transaction: any) => {
      const dateStr = new Date(transaction.date).toLocaleDateString(); // Adjust based on actual structure
      const amount = transaction.amount;
  
      // Initialize or accumulate the amount for the date
      if (cumulativeData[dateStr]) {
        cumulativeData[dateStr] += amount;
      } else {
        cumulativeData[dateStr] = amount;
      }
    });
  
    // Prepare arrays for labels and data
    const dates = Object.keys(cumulativeData);
    const amounts = Object.values(cumulativeData);
  
    // Set up the chart data
    this.barChartData = {
      labels: dates,
      datasets: [
        {
          label: 'Cumulative Amount',
          data: amounts,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  }
}
