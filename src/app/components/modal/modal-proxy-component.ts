import { Component, inject, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { Clipboard } from '@angular/cdk/clipboard';  // Import Clipboard service
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
        <button class="btn btn-outline-primary" (click)="activeTab = 1" [class.active]="activeTab === 1">Edit/Config</button>
        <button class="btn btn-outline-primary" (click)="activeTab = 2" [class.active]="activeTab === 2">Request</button>
        <button class="btn btn-outline-primary" (click)="activeTab = 3" [class.active]="activeTab === 3">Destination</button>
      </div>

      <div class="mt-3">
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
              <label for="payload">Request Body:</label>
              <textarea id="payload" [(ngModel)]="proxyConfig.payload" rows="5" placeholder="Enter request payload"></textarea>
            </div>
          </div>

          <div class="button-row">
            <button class="save-button" (click)="saveConfig()">Save</button>
            <button class="load-button" (click)="loadConfig()">Load</button>
            <button class="go-button" (click)="sendRequest()">Go</button>
          </div>
        </div>

        <div *ngIf="activeTab === 2">
          <h3>Proxy Request</h3>

          <div class="pre-container">
            <pre>{{ formattedCurlRequest }}</pre>
            <button (click)="copyToClipboard(formattedCurlRequest)" class="btn btn-outline-secondary btn-sm copy-button">
              <i class="fas fa-copy"></i> <!-- Font Awesome Copy Icon -->
            </button>
          </div>
        </div>

        <div *ngIf="activeTab === 3">
          <h3>Destination</h3>
        </div>
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
  @Input() proxyResponse: any = {};

  activeTab = 1; // Default active tab

  // Computed property to format the curl request
  get formattedCurlRequest(): string {
    return `curl --location '${this.proxyUrl}'
--header 'Content-Type: application/json'
--header 'Authorization: ${this.generateProxyAuth}'
--data '${this.formattedProxyData}'`;
  }

  get proxyUrl(): string {
    return this.proxyConfig.url || 'https://example.com/api/proxy';
  }

  get generateProxyAuth(): string {
    return "Basic " + btoa(this.proxyConfig.username + ":" + this.proxyConfig.password);
  }

  get formattedProxyData(): string {
    const jsonData = JSON.stringify(this.proxyConfig.payload);
    return jsonData.replace(/(\r\n|\n|\r)/g, "");  // Ensure single line without newlines
  }

  ngOnInit() {
    console.log('Proxy configuration received in modal:', this.proxyConfig);
  }

  saveConfig() {
    localStorage.setItem('proxyConfig', JSON.stringify(this.proxyConfig));
    console.log('Config saved');
  }

  loadConfig() {
    const savedConfig = localStorage.getItem('proxyConfig');
    if (savedConfig) {
      this.proxyConfig = JSON.parse(savedConfig);
      console.log('Config loaded');
    } else {
      console.log('No saved config found');
    }
  }

  sendRequest() {
    this.activeTab = 2; // Switch to the "Request" tab to show the generated curl
  }

  // Copy the curl request to clipboard
  copyToClipboard(data: string): void {
    this.clipboard.copy(data); // This copies the data to the clipboard
    alert('Copied to clipboard!'); // Provide feedback to the user
  }
}
