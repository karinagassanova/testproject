import { Component, OnInit } from '@angular/core';
import { DataService } from './services/data.service';
import { JsonPipe, NgIf } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [
    JsonPipe,
    NgIf,
    RouterOutlet,
    FormsModule
  ],
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  data: any;
  title: string | undefined;
  num1: number = 0;
  num2: number = 0;
  result: number | null = null;

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    // Initialize data if needed
    this.loadData();
  }

  // Fetch data from the serverless endpoint
  loadData(): void {
    this.dataService.getData().subscribe(
      (response) => {
        this.data = response;
      },
      (error) => {
        console.error('Error fetching data from serverless endpoint', error);
      }
    );
  }

  // Handle form submission
  onSubmit(): void {
    this.dataService.addNumbers(this.num1, this.num2).subscribe(
      (response) => {
        this.result = response.result;
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }
}
