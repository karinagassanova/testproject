import {Component, OnInit, OnDestroy, Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';
import {DiagramComponent} from "./components/diagram/diagram.component";
import {SharedService} from "./services/sharedservice";

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

@Injectable({
  providedIn: "root"
})
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  private messageSubscription: Subscription | undefined;
  scfrInstance: any;

  message: string = ""

  username: string = 'bluefin';
  password: string = 'yO98lWEvIZ';
  templateId: string = 'BluefinSecurity';
  baseUrl: string = 'https://secure-cert.shieldconex.com';
  width: number = 600;
  height: number = 800;
  iframeRenderStatus: string = '';
  iframeErrors: string[] = [];
  SCXTokens: SCXEntry[] = [];
  readResponse: TokenResponse | undefined;
  tokenData: TokenDisplay[] = [];
  detokenizedData: string[] = []; // Added this for displaying detokenized data
  showConsole: boolean = false;
  isGoPressed: boolean = false;

  constructor(private http: HttpClient, private diagram: DiagramComponent, private sharedService :SharedService) {}

  ngOnInit() {
    this.messageSubscription = new Subscription();
    window.addEventListener('message', this.onMessage.bind(this));
    this.diagram.hideAll()
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
  private tempTokenData: TokenDisplay | undefined;
  onShieldconexToken(tokenData: any) {
    console.log('Received Token Data:', tokenData);

    if (typeof tokenData === 'object' && tokenData.token) {
      const token = tokenData.token;

      // Store the token data temporarily
      this.tempTokenData = { token };

      // Add the token to databaseItems
      this.databaseItems.push({ id: this.databaseItems.length + 1, token });

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
      this.sharedService.highlightMessage.next("detokenize")
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
      this.sharedService.highlightMessage.next("show_iframe")
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
      this.iframeOutlineColor = 'orange';
      this.isGoPressed = true; // Set this to true when Go is clicked
    } else {
      alert('Please enter a Template ID.');
    }
  }

  onTokenizeButtonClick() {
    if (this.scfrInstance) {
      this.sharedService.highlightMessage.next("tokenize")
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

  toggleConsole() {
    this.showConsole = !this.showConsole;
  }
  databaseItems: { id: number; token: string }[] = [];


  viewTokens(id: number) {
    const tokenData = this.databaseItems.find(item => item.id === id);

    if (tokenData) {
      this.sharedService.highlightMessage.next("view_tokens")
      console.log(`Viewing tokens for ID ${id}:`, tokenData);

      // Display the temporarily stored token data
      this.tokenData = [this.tempTokenData!]; // Use the temporary token data
    } else {
      console.error(`No token data found for ID ${id}`);
      this.iframeErrors.push(`No token data found for ID ${id}`);
    }
  }

  isConfigFolded = false;

  toggleConfigFold() {
    this.isConfigFolded = !this.isConfigFolded;
  }
  iframeOutlineColor: string = 'black'; // Default color

  isIframeFolded: boolean = false;

  // Toggle function for the IFrame visibility
  toggleIframeFold() {
    this.isIframeFolded = !this.isIframeFolded;
  }
}
