import {Component, inject, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {JsonPipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgbNavModule} from '@ng-bootstrap/ng-bootstrap';
import {CommonModule} from '@angular/common';
import {Clipboard} from '@angular/cdk/clipboard';

@Component({
  selector: 'ngbd-proxy-modal-content',
  standalone: true,
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Proxy Configuration</h4>
      <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss('Cross click')"></button>
    </div>

    <div class="modal-body">
      <div class="btn-group" role="group" aria-label="Tab Navigation">
        <button class="btn btn-outline-primary" (click)="activeTab = 1" [class.active]="activeTab === 1">Edit/Config
        </button>
        <button class="btn btn-outline-primary" (click)="activeTab = 2" [class.active]="activeTab === 2">Request
        </button>
        <button class="btn btn-outline-primary" (click)="activeTab = 3" [class.active]="activeTab === 3">Destination
        </button>
      </div>

      <div *ngIf="activeTab === 1" id="edit-config-container">
        <h3>Edit Configuration</h3>
        <div class="input-row">
          <div class="input-group">
            <label for="proxyConfigId">Proxy Config ID:</label>
            <input type="text" id="proxyConfigId" [(ngModel)]="proxyConfig.bfid" placeholder="Enter Proxy Config ID"/>
          </div>
        </div>

        <div class="input-row">
          <div class="input-group">
            <label for="proxyUrl">Proxy URL:</label>
            <input type="text" id="proxyUrl" [(ngModel)]="proxyConfig.url" placeholder="Enter Proxy URL"/>
          </div>
        </div>

        <div class="input-row">
          <div class="input-group">
            <label for="payload">Substitute Data:</label>
            <textarea id="payload" [(ngModel)]="substituteData" rows="5" placeholder="Enter request payload"></textarea>
          </div>
        </div>

        <div class="input-row">
          <div class="input-group">
            <label for="payload">Request Body:</label>
            <textarea id="payload" [(ngModel)]="proxyConfig.payload" rows="5" placeholder="Enter request payload"></textarea>
          </div>
        </div>

        <!-- Save Configuration with a Name -->
        <div class="input-row">
          <div class="input-group">
            <label for="configName">Save Config Name:</label>
            <input type="text" id="configName" [(ngModel)]="saveConfigName" placeholder="Enter a name for this configuration"/>
          </div>
        </div>

        <!-- Dropdown to Select and Load/Delete Config -->
        <div class="input-row">
          <label for="savedConfigs">Manage Saved Configs:</label>
          <select id="savedConfigs" [(ngModel)]="selectedConfigId" class="form-select">
            <option *ngFor="let config of savedConfigs" [value]="config.id">{{ config.name }}</option>
          </select>

        </div>

        <div class="button-row">
          <button class="btn btn-primary" (click)="loadSelectedConfig()">Load</button>
          <button class="btn btn-primary" (click)="deleteSelectedConfig()">Delete</button>
          <button class="btn btn-outline-secondary" (click)="saveConfig()">Save</button>
          <button class="btn btn-outline-secondary" (click)="sendRequest()">Go</button>
        </div>
      </div>

      <div *ngIf="activeTab === 2">
        <h3>Proxy Request</h3>

        <div class="pre-container">
          <pre>{{ formattedCurlRequest }}</pre>
          <button (click)="copyToClipboard(formattedCurlRequest)"
                  class="btn btn-outline-secondary btn-sm copy-button">
            <i class="fas fa-copy"></i> <!-- Font Awesome Copy Icon -->
          </button>
        </div>
      </div>

      <div *ngIf="activeTab === 3">
        <h3>Destination</h3>
      </div>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-outline-secondary" (click)="activeModal.close('Close click')">Close</button>
    </div>
  `,
  imports: [
    JsonPipe,
    FormsModule,
    NgbNavModule,
    CommonModule,
  ],
  styleUrls: ['./modal-component.css']
})
export class NgbdProxyModalContent implements OnInit {
  activeModal = inject(NgbActiveModal);
  clipboard = inject(Clipboard); // Inject Clipboard service

  @Input() proxyConfig: any = {};
  @Input() substituteData: any = {};
  @Input() proxyResponse: any = {};

  activeTab = 1; // Default active tab
  savedConfigs: Array<{ id: string; name: string; data: any }> = []; // Saved configurations array
  saveConfigName: string = ''; // Name for the configuration to be saved
  selectedConfigId: string = ''; // Selected configuration ID from the dropdown

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
      alert(`Configuration "${selectedConfig.name}" loaded successfully!`);
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
}
