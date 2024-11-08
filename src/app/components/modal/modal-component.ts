import { Component, inject, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {TokenResponse} from "../../app.component";

@Component({
  selector: 'ngbd-modal-content',
  standalone: true,
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Token Data</h4>
      <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss('Cross click')"></button>
    </div>
    <div class="modal-body">
      <pre>{{ formattedTokens }}</pre> <!-- Use the formattedTokens property -->
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-secondary" (click)="activeModal.close('Close click')">Close</button>
    </div>
  `,
})
export class NgbdModalContent implements OnInit {
  activeModal = inject(NgbActiveModal);
  @Input() tokenResponse: TokenResponse | undefined = undefined; // Accept an array of tokens

  // Computed property to format tokens
  get formattedTokens(): string {
    return JSON.stringify(this.tokenResponse, null, 4)
    //return this.tokenResponse.map(e => `BFID: ${e.token}`).join('\n'); // Format the output
  }

  ngOnInit() {
    console.log('Tokens received in modal:', this.tokenResponse); // Log the tokens received
  }

}
