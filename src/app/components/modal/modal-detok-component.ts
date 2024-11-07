import { Component, inject, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JsonPipe } from "@angular/common";

@Component({
  selector: 'ngbd-detoken-modal-content',
  standalone: true,
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Detokenized Data</h4>
      <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss('Cross click')"></button>
    </div>
    <div class="modal-body">
      <pre>{{ formattedDetokenizedData }}</pre>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-secondary" (click)="activeModal.close('Close click')">Close</button>
    </div>
  `,
  imports: [
    JsonPipe
  ]
})
export class NgbdDetokenModalContent implements OnInit {
  activeModal = inject(NgbActiveModal);

  @Input() detokenizedData: any[] = [];
  @Input() SCXTokens: Array<{ name: string }> = [];


  get formattedDetokenizedData(): string {
    return this.detokenizedData.map((value, index) => {
      const tokenName = this.SCXTokens[index]?.name || 'Unknown Token';
      return `Name: ${tokenName}, Detokenized Value: ${JSON.stringify(value, null, 2)}`;
    }).join('\n');
  }

  ngOnInit() {
    console.log('Detokenized data received in modal:', this.detokenizedData);
    console.log('SCXTokens received in modal:', this.SCXTokens);
  }
}
