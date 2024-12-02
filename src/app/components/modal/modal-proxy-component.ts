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
              <label for="payload">Substitute Data:</label>
              <textarea id="payload" [(ngModel)]="substituteData" rows="5"
                        placeholder="Enter request payload"></textarea>
            </div>
          </div>

          <div class="input-row">
            <div class="input-group">
              <label for="payload">Request Body:</label>
              <textarea id="payload" [(ngModel)]="proxyConfig.payload" rows="5"
                        placeholder="Enter request payload"></textarea>
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


  get proxyUrl(): string {
    return this.proxyConfig.url || 'https://example.com/api/proxy';
  }

  get generateProxyAuth(): string {
    return "Basic " + btoa(this.proxyConfig.username + ":" + this.proxyConfig.password);
  }

  get formattedCurlRequest(): string {
    // Construct the curl string with the full path, including the dynamic config ID
    const fullUrl = `${this.proxyUrl}/api/v1/partners/bluefin/configurations/${this.proxyConfig.bfid}`;

    return `curl --location '${fullUrl}'
--header 'Content-Type: application/json'
--header 'Authorization: ${this.generateProxyAuth}'
--data ${this.formattedProxyData}`;
  }


  get formattedProxyData(): string {

    const pl = JSON.parse(this.proxyConfig.payload)
    const scx = JSON.parse(this.substituteData)

    const body = this.recursiveSubstitute(pl, scx.values)

    // Ensure pretty print without wrapping quotes or escaping
    const jsonData = JSON.stringify(body, null, 4); // Pretty-print the JSON
    return jsonData.replace(/\\n/g, '\n').replace(/\\\"/g, '"'); // Ensure no escape characters
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

  getReplacementValue(key: any, array : any[]) {
    const item = array.find(entry => entry.name === key);
    return item ? item.value : `$${key}`; // Return the original if not found
  }

  recursiveSubstitute(target : any, arr: any[]) : any {

    if (typeof target === 'object' && target !== null) {
      // If the target is an array, recursively process each element
      if (Array.isArray(target)) {
        // return target.map(this.recursiveSubstitute, arr);
      }
      // If the target is an object, recursively process its properties
      else {
        const result = {};
        for (const key in target) {
          // @ts-ignore
          result[key] = this.recursiveSubstitute(target[key], arr);
        }
        return result;
      }
    } else if (typeof target === 'string' && target.startsWith('$')) {
      return this.getReplacementValue(target.slice(1), arr);
    }

    // Return the target as is if no substitution is required
    return target;
  }
}
