import { Component, inject, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JsonPipe } from "@angular/common";
import { Clipboard } from '@angular/cdk/clipboard';  // Import Clipboard service

@Component({
  selector: 'ngbd-detoken-modal-content',
  standalone: true,
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Detokenize Data</h4>
      <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss('Cross click')"></button>
    </div>
    <div class="modal-body">
      <h3>Request</h3>
      <div class="copy-container">
    <pre>
      curl --location 'https://secure-cert.shieldconex.com/api/tokenization/detokenize' \\\\
      --header 'Content-Type: application/json' \\\\
      --header 'Authorization: {{ generateAuth }}' \\\\
      --data-raw '{{ formattedtokenData }}'
    </pre>
        <button (click)="copyToClipboard(formattedRequestData)" class="btn btn-outline-secondary btn-sm copy-button">
          <i class="fas fa-copy"></i> <!-- Font Awesome Copy Icon -->
        </button>
      </div>

      <h3>Response</h3>
      <div class="copy-container">
        <pre>{{ formattedDetokenizedData }}</pre>
        <button (click)="copyToClipboard(formattedDetokenizedData)"
                class="btn btn-outline-secondary btn-sm copy-button">
          <i class="fas fa-copy"></i> <!-- Font Awesome Copy Icon -->
        </button>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-secondary" (click)="activeModal.close('Close click')">Close</button>
    </div>

  `,
  imports: [
    JsonPipe
  ],
  styleUrls: ['./modal-component.css']
})
export class NgbdDetokenModalContent implements OnInit {
  activeModal = inject(NgbActiveModal);

  @Input() tokenData: any = {};
  @Input() detokenizedData: any[] = [];
  @Input() SCXTokens: Array<{ name: string }> = [];

  constructor(private clipboard: Clipboard) {}

  // Generate Auth Header
  get generateAuth(): string {
    return "Basic " + btoa(this.tokenData.username + ":" + this.tokenData.password);
  }

  // Format token data for request
  get formattedtokenData(): string {
    return JSON.stringify({ bfid: this.tokenData.bfid, values: this.tokenData.values }, null, 4);
  }

  // Format detokenized data for response
  get formattedDetokenizedData(): string {
    return JSON.stringify(this.detokenizedData, null, 4);
  }

  // Concatenate the formatted request for copy
  get formattedRequestData(): string {
    return `curl --location 'https://secure-cert.shieldconex.com/api/tokenization/detokenize' \\
--header 'Content-Type: application/json' \\
--header 'Authorization: ${this.generateAuth}' \\
--data-raw '${this.formattedtokenData}'`;
  }

  // Copy data to clipboard
  copyToClipboard(data: string): void {
    this.clipboard.copy(data); // This copies the data to the clipboard
    alert('Copied to clipboard!'); // Provide feedback to the user
  }

  ngOnInit() {
    console.log('Detokenized data received in modal:', this.detokenizedData);
    console.log('SCXTokens received in modal:', this.SCXTokens);
  }

  protected readonly JSON = JSON;
}
