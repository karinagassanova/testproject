import { Component, inject, Input, OnInit } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { Clipboard } from '@angular/cdk/clipboard';
import { HttpClient, HttpHeaders } from '@angular/common/http';  // Import HttpClient

@Component({
  selector: 'app-proxy-config',
  standalone: true,
  template: `
    <div class="main-container">
      <h4>Proxy Configuration
        <!-- Fold/Unfold Button -->
        <button class="btn btn-outline-secondary btn-sm ms-2" (click)="toggleConfigVisibility()">
          <i class="fas" [ngClass]="isConfigVisible ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
        </button>
      </h4>

      <!-- Tab Navigation -->
      <ul class="nav nav-tabs">
        <li class="nav-item">
          <a class="nav-link" [class.active]="activeTab === 1" (click)="activeTab = 1">Edit Configuration</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" [class.active]="activeTab === 2" (click)="activeTab = 2">Proxy Request</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" [class.active]="activeTab === 3" (click)="activeTab = 3">Destination</a>
        </li>
      </ul>

      <!-- Edit Configuration Tab -->
      <div *ngIf="activeTab === 1 && isConfigVisible" id="edit-config-container">
        <div class="form-grid">
          <div class="form-group">
            <label for="proxyConfigId">Proxy Config ID:</label>
            <input type="text" id="proxyConfigId" [(ngModel)]="proxyConfig.bfid" placeholder="Enter Proxy Config ID"/>
          </div>
          <div class="form-group">
            <label for="proxyUrl">Proxy URL:</label>
            <input type="text" id="proxyUrl" [(ngModel)]="proxyConfig.url" placeholder="Enter Proxy URL"/>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label for="payload">Substitute Data:</label>
            <textarea id="payload" [(ngModel)]="substituteData" rows="3" placeholder="Enter request payload"></textarea>
          </div>
          <div class="form-group">
            <label for="payload">Request Body:</label>
            <textarea id="payload" [(ngModel)]="proxyConfig.payload" rows="3" placeholder="Enter request payload"></textarea>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label for="configName">Save Config Name:</label>
            <input type="text" id="configName" [(ngModel)]="saveConfigName" placeholder="Enter configuration name"/>
          </div>
          <div class="form-group">
            <label for="savedConfigs">Manage Saved Configs:</label>
            <select id="savedConfigs" [(ngModel)]="selectedConfigId" class="form-select">
              <option *ngFor="let config of savedConfigs" [value]="config.id">{{ config.name }}</option>
            </select>
          </div>
        </div>

        <div class="button-row">
          <button class="btn btn-primary" (click)="loadSelectedConfig()">Load</button>
          <button class="btn btn-primary" (click)="deleteSelectedConfig()">Delete</button>
          <button class="btn btn-outline-secondary" (click)="saveConfig()">Save</button>
          <button class="btn btn-outline-secondary" (click)="sendRequest()">Go</button>
        </div>
      </div>

      <div *ngIf="activeTab === 2">
        <div class="pre-container" style="position: relative;">
          <pre>{{ formattedCurlRequest }}</pre>
          <button (click)="copyToClipboard(formattedCurlRequest)" class="copy-button">
            <i class="fas fa-copy"></i> <!-- Copy Icon -->
          </button>
        </div>
      </div>



      <!-- Destination Tab -->
      <div *ngIf="activeTab === 3">
        <!-- Add more content related to the destination here -->
      </div>
    </div>
  `,
  imports: [
    JsonPipe,
    FormsModule,
    NgbNavModule,
    CommonModule,
  ],
  styleUrls: ['./proxy.css']
})
export class ProxyConfigComponent implements OnInit {
  clipboard = inject(Clipboard); // Inject Clipboard service
  private httpClient = inject(HttpClient); // Inject HttpClient

  @Input() proxyConfig: any = {};
  @Input() substituteData: any = {};
  @Input() proxyResponse: any = {};

  activeTab = 1; // Default active tab is 1 (Edit Configuration)
  savedConfigs: Array<{ id: string; name: string; data: any }> = [];
  saveConfigName: string = '';
  selectedConfigId: string = '';
  isConfigVisible: boolean = true; // Controls the visibility of the config section

  ngOnInit() {
    this.loadAllConfigs(); // Load all configurations on init
  }

  saveConfig() {
    if (!this.saveConfigName.trim()) {
      alert('Please enter a name for the configuration!');
      return;
    }

    const newConfig = {
      id: Date.now().toString(), // Unique ID for each config
      name: this.saveConfigName.trim(),
      data: { ...this.proxyConfig }, // Clone the proxyConfig to store
    };

    this.savedConfigs.push(newConfig);
    localStorage.setItem('proxyConfigs', JSON.stringify(this.savedConfigs));
    alert(`Configuration "${this.saveConfigName}" saved successfully!`);
    this.saveConfigName = ''; // Clear the input
  }

  loadAllConfigs() {
    const saved = localStorage.getItem('proxyConfigs');
    if (saved) {
      this.savedConfigs = JSON.parse(saved);
    } else {
      this.savedConfigs = [];
    }
  }

  loadSelectedConfig() {
    const selectedConfig = this.savedConfigs.find(config => config.id === this.selectedConfigId);
    if (selectedConfig) {
      this.proxyConfig = { ...selectedConfig.data };
    } else {
      alert('No configuration selected or found.');
    }
  }

  deleteSelectedConfig() {
    const index = this.savedConfigs.findIndex(config => config.id === this.selectedConfigId);
    if (index !== -1) {
      const deletedConfig = this.savedConfigs.splice(index, 1)[0];
      localStorage.setItem('proxyConfigs', JSON.stringify(this.savedConfigs));
      alert(`Configuration "${deletedConfig.name}" deleted successfully!`);
      this.selectedConfigId = ''; // Clear the selection
    } else {
      alert('No configuration selected to delete.');
    }
  }

  sendRequest() {
    this.activeTab = 2; // Switch to the "Request" tab
  }

  copyToClipboard(data: string): void {
    this.clipboard.copy(data);
    alert('Copied to clipboard!');
  }

  get proxyUrl(): string {
    return this.proxyConfig.url || 'https://example.com/api/proxy';
  }

  get generateProxyAuth(): string {
    return 'Basic ' + btoa(`${this.proxyConfig.username}:${this.proxyConfig.password}`);
  }

  get formattedCurlRequest(): string {
    const fullUrl = `${this.proxyUrl}/api/v1/partners/bluefin/configurations/${this.proxyConfig.bfid}`;
    return `curl --location '${fullUrl}'
--header 'Content-Type: application/json'
--header 'Authorization: ${this.generateProxyAuth}'
--data ${this.formattedProxyData}`;
  }

  get formattedProxyData(): string {
    const pl = JSON.parse(this.proxyConfig.payload || '{}');
    const scx = JSON.parse(this.substituteData || '{}');
    const body = this.recursiveSubstitute(pl, scx.values || []);
    return JSON.stringify(body, null, 4).replace(/\\n/g, '\n').replace(/\\"/g, '"');
  }

  recursiveSubstitute(target: any, arr: any[]): any {
    if (typeof target === 'object' && target !== null) {
      if (Array.isArray(target)) {
        return target.map(item => this.recursiveSubstitute(item, arr));
      } else {
        const result: any = {};
        for (const key in target) {
          result[key] = this.recursiveSubstitute(target[key], arr);
        }
        return result;
      }
    } else if (typeof target === 'string' && target.startsWith('$')) {
      return this.getReplacementValue(target.slice(1), arr);
    }
    return target;
  }

  getReplacementValue(key: string, array: any[]): any {
    const item = array.find(entry => entry.name === key);
    return item ? item.value : `$${key}`;
  }

  toggleConfigVisibility() {
    this.isConfigVisible = !this.isConfigVisible; // Toggle visibility of the configuration section
  }
}
