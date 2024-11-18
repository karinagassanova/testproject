import { Component, inject, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TokenResponse } from "../../app.component";
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'ngbd-modal-content',
  standalone: true,
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Token Data</h4>
      <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss('Cross click')"></button>
    </div>

    <div class="modal-body">
      <div class="copy-container">
        <pre class="wrapped-pre">{{ formattedTokens }}</pre>
        <button (click)="copyToClipboard(formattedTokens)" class="btn btn-outline-secondary btn-sm copy-button">
          <i class="fas fa-copy"></i> <!-- Font Awesome Copy Icon -->
        </button>
      </div>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-outline-secondary" (click)="activeModal.close('Close click')">Close</button>
    </div>

  `,
  styleUrls: ['./modal-component.css'],  // Link the CSS file for styling
})
export class NgbdModalContent implements OnInit {
  activeModal = inject(NgbActiveModal);
  clipboard = inject(Clipboard); // Inject Clipboard service
  @Input() tokenResponse: TokenResponse | undefined = undefined;

  // Computed property to format tokens
  get formattedTokens(): string {
    return JSON.stringify(this.tokenResponse, null, 4);
  }

  ngOnInit() {
    console.log('Tokens received in modal:', this.tokenResponse);
  }

  // Copy data to clipboard
  copyToClipboard(data: string): void {
    this.clipboard.copy(data); // This copies the data to the clipboard
    alert('Copied to clipboard!'); // Provide feedback to the user
  }
}
