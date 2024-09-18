import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import {JsonPipe, NgForOf, NgIf} from '@angular/common';

interface TokenResponse {
  messageId: string;
  bfid: string;
  reference: string;
  values: SCXEntry[];
}

interface DetokenizeResponse {
  values: string[];
}

type IFrameConfigTypeAttributes = {
  width: number;
  height: number;
  frameborder: number;
};

type IFrameConfigType = {
  baseUrl: string;
  templateId: string;
  parent: string;
  attributes: IFrameConfigTypeAttributes;
};

type SCXEntry = {
  name: string;
  value: string;
};

type TokenDisplay = {
  token: string;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [FormsModule, NgForOf, JsonPipe, NgIf],
  standalone: true
})
export class AppComponent implements OnInit, OnDestroy {
  private messageSubscription: Subscription | undefined;
  scfrInstance: any;

  username: string = 'bluefin';
  password: string = 'yO98lWEvIZ';
  templateId: string = 'BluefinSecurity';
  baseUrl: string = '';
  width: number = 600;
  height: number = 800;
  iframeRenderStatus: string = '';
  iframeErrors: string[] = [];
  SCXTokens: SCXEntry[] = [];
  readResponse: TokenResponse | undefined;
  tokenData: TokenDisplay[] = [];
  detokenizedData: string[] = []; // Added this for displaying detokenized data
  protected isDiagramVisible: boolean | undefined;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.messageSubscription = new Subscription();
    window.addEventListener('message', this.onMessage.bind(this));
  }

  ngOnDestroy() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    window.removeEventListener('message', this.onMessage.bind(this));
  }

  displayMessage(message: any, elementId: string) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = JSON.stringify(message, null, 2);
    }
  }

  onShieldconexRendered() {
    this.iframeRenderStatus = 'IFrame rendering initiated.';
  }

  onShieldconexError(error: any) {
    console.log('Error', error);
    this.iframeErrors.push(error.message);
  }

  onShieldconexToken(tokenData: any) {
    console.log('Received Token Data:', tokenData);

    if (typeof tokenData === 'object' && tokenData.token) {
      const token = tokenData.token;

      // Display the token data
      this.tokenData.push({ token });

      this.http.post<TokenResponse>(
        'https://st3nuq5s37.execute-api.us-east-1.amazonaws.com/token/handle',
        {
          bfid: token,
          username: this.username,
          password: this.password
        },
        {
          headers: new HttpHeaders({
            Accept: 'application/json',
            'Content-Type': 'application/json'
          })
        }
      ).subscribe(
        (response) => {
          console.log('Received Tokenized Data:', response);

          if (!response || !response.values) {
            console.error('Invalid response:', response);
            this.iframeErrors.push('Invalid response received.');
            return;
          }

          // Display the tokenized data
          this.SCXTokens = [...response.values];
          this.readResponse = response;
        },
        (error) => {
          console.error('Error retrieving tokens:', error);
          this.iframeErrors.push(error.message);
        }
      );
    } else {
      this.iframeErrors.push('Invalid token data received.');
    }
  }

  onDetokenizeButtonClick() {
    if (this.readResponse) {
      const bfid = this.readResponse.bfid; // Fetch BFID from the read response
      const values = this.SCXTokens
      const username = this.username;
      const password = this.password;

      // Log the data being sent to the API for debugging
      console.log({
        bfid: bfid,
        values: values,
        username: username,
        password: password
      });

      // Basic validation checks
      if (!bfid) {
        this.iframeErrors.push('BFID is missing.');
        return;
      }
      if (values.length === 0) {
        this.iframeErrors.push('No token values available for detokenization.');
        return;
      }
      if (!username || !password) {
        this.iframeErrors.push('Username or password is missing.');
        return;
      }


      this.http.post<DetokenizeResponse>(
        'https://st3nuq5s37.execute-api.us-east-1.amazonaws.com/token/detokenize',
        {
          bfid: bfid,
          values: values,
          username: username,
          password: password
        },
        {
          headers: new HttpHeaders({
            Accept: 'application/json',
            'Content-Type': 'application/json'
          })
        }
      ).subscribe(
        (response) => {
          console.log('Received Detokenized Data:', response);

          if (!response || !response.values) {
            console.error('Invalid response:', response);
            this.iframeErrors.push('Invalid response received.');
            return;
          }

          // Store and display the detokenized data
          this.detokenizedData = response.values;
        },
        (error) => {
          console.error('Error getting detokenized data:', error);
          this.iframeErrors.push(error.message);
        }
      );
    } else {
      alert('No tokenized data available to detokenize.');
    }
  }

  onGoButtonClick() {
    if (this.templateId && this.baseUrl) {
      const iframeConfigVersion2: IFrameConfigType = {
        baseUrl: this.baseUrl,
        templateId: this.templateId,
        parent: 'frame1',
        attributes: {
          width: this.width,
          height: this.height,
          frameborder: 0
        }
      };

      // Create and render the ShieldConex IFrame
      // @ts-ignore
      this.scfrInstance = new ShieldconexIFrame(iframeConfigVersion2);

      this.scfrInstance.onRendered = () => {
        this.onShieldconexRendered();
        const tokenizeButton = document.getElementById('tokenizeButton') as HTMLButtonElement;
        if (tokenizeButton) {
          tokenizeButton.disabled = false;
        }
      };
      this.scfrInstance.onError = this.onShieldconexError.bind(this);
      this.scfrInstance.onToken = this.onShieldconexToken.bind(this);

      this.scfrInstance.render();
    } else {
      alert('Please enter a Template ID.');
    }
  }

  onTokenizeButtonClick() {
    if (this.scfrInstance) {
      try {
        this.scfrInstance.tokenize('echo data');
      } catch (error: any) {
        this.iframeErrors.push(error.message);
      }
    } else {
      alert('Please render the IFrame first by clicking Go.');
    }
  }

  onClearButtonClick() {
    if (this.scfrInstance) {
      try {
        this.scfrInstance.clear('echo data');
      } catch (error: any) {
        this.iframeErrors.push(error.message);
      }
    } else {
      alert('Please render the IFrame first by clicking Go.');
    }
  }

  onMessage(event: MessageEvent) {
    if (event.origin !== 'https://secure-cert.shieldconex.com') {
      return;
    }

    console.log('onMessage', event.data);

    let data;
    try {
      data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
    } catch (e) {
      data = event.data;
      console.error('Failed to parse event data:', e);
    }

    switch (data.method) {
      case 'scfr:validating':
        console.log('Validating:', data);
        break;
      case 'scfr:processing':
        console.log('Processing:', data.status);
        break;
      case 'scfr:token':
        this.onShieldconexToken(data);
        break;
      default:
        this.iframeErrors.push('Unknown message received: ' + JSON.stringify(data, null, 4));
    }
  }
  showDiagram(): void {
    this.isDiagramVisible = true;
  }

  hideDiagram(): void {
    this.isDiagramVisible = false;
  }
}
