import {Component, OnInit, OnDestroy, Injectable, NgIterable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { DiagramComponent } from "./components/diagram/diagram.component";
import { SharedService } from "./services/sharedservice";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalContent } from './components/modal/modal-component'; // Adjust the path accordingly
import { NgbdDetokenModalContent } from './components/modal/modal-detok-component';
import { ChangeDetectorRef } from '@angular/core';


export interface TokenResponse {
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

type Database = {
  data : TokenResponse[];
}

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
  db: Database = {data:[]};

  flow: string = 'proxy'; // Current flow, defaults to "tokenization"
  settingName: string | undefined;

  showFlow(selectedFlow: string) {
    this.flow = selectedFlow; // Update flow based on button clicks
  }

  constructor(
    private http: HttpClient,
    private diagram: DiagramComponent,
    private sharedService: SharedService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.messageSubscription = new Subscription();
    window.addEventListener('message', this.onMessage.bind(this));
    this.diagram.hideAll();
    this.savedSettingNames = this.getSavedSettingNames();

  }

  ngOnDestroy() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    window.removeEventListener('message', this.onMessage.bind(this));
  }

  private destroyIFrame(parentId :string) {
    const parent = document.getElementById(parentId) as HTMLDivElement;
    if (parent) {
      parent.innerHTML = ""
    }
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
  active = 1;
  onShieldconexToken(tokenData: any) {
    console.log('Received Token Data:', tokenData);

    if (typeof tokenData === 'object' && tokenData.token) {
      const token = tokenData.token;

      // Store the token data temporarily
      this.tempTokenData = { token };

      // Add the token to databaseItems
      //this.db.data.push({ id: this.databaseItems.length + 1, token });


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
          this.db.data.push(response);

          // Display the tokenized data
          this.SCXTokens = [...response.values];
          this.readResponse = response;

          // Switch to the "Database" tab after successful processing
          this.active = 1;
        },
        (error) => {
          console.error('Error retrieving tokens:', error);
          this.iframeErrors.push(error.message);
        }
      );
    } else {
      console.error('Invalid token data received:', tokenData);
      this.iframeErrors.push('Invalid token data format.');
    }
  }


  onDetokenizeButtonClick( id : string) {

    const tokenData = this.db.data.find(item => item.bfid === id);

    if (tokenData) {
      this.sharedService.highlightMessage.next("detokenize");
      const bfid = tokenData.bfid; // Fetch BFID from the read response
      const values = tokenData.values // Values that need to be detokenized
      const username = this.username;
      const password = this.password;
      this.flow = 'detokenization';

      console.log({ bfid, values, username, password });

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

          this.detokenizedData = response.values;
          this.openDetokenizedModal(this.detokenizedData);
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

  openDetokenizedModal(detokenizedData: any[]) {
    const modalRef = this.modalService.open(NgbdDetokenModalContent);
    modalRef.componentInstance.detokenizedData = detokenizedData;
    modalRef.componentInstance.SCXTokens = this.SCXTokens;
  }

  onGoButtonClick() {
    if (this.templateId && this.baseUrl) {
      this.sharedService.highlightMessage.next("show_iframe");

      let parentId = 'frame1'

      this.destroyIFrame(parentId);

      const iframeConfigVersion2: IFrameConfigType = {
        baseUrl: this.baseUrl,
        templateId: this.templateId,
        parent: parentId,
        attributes: {
          width: this.width,
          height: this.height,
          frameborder: 0
        }
      };

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
      this.isGoPressed = true;
    } else {
      alert('Please enter a Template ID.');
    }
  }


  onTokenizeButtonClick() {
    if (this.scfrInstance) {
      this.sharedService.highlightMessage.next("tokenize");
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

  viewTokens(id: string) {

    console.log("this.db.data", this.db.data)
    const tokenData = this.db.data.find(item => item.bfid === id);

    console.log("tokenData", tokenData)

    if (tokenData) {
      this.sharedService.highlightMessage.next("view_tokens");
      console.log(`Viewing tokens for ID ${id}:`, tokenData);
      this.openModal(tokenData);
    } else {
      console.error(`No token data found for ID ${id}`);
      this.iframeErrors.push(`No token data found for ID ${id}`);
    }
  }

  openModal(tokenData: TokenResponse) {
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.tokenResponse = tokenData;
  }

  isConfigFolded = false;

  toggleConfigFold() {
    this.isConfigFolded = !this.isConfigFolded;
  }

  iframeOutlineColor: string = 'black';

  isIframeFolded: boolean = false;

  toggleIframeFold() {
    this.isIframeFolded = !this.isIframeFolded;
  }


  protected saveUserSettings() {
    const settingName = this.settingName || 'Default Setting'; // Use provided name or fallback to 'Default Setting'

    // Prepare the settings object
    const userSettings = {
      username: this.username,
      password: this.password,
      templateId: this.templateId,
      baseUrl: this.baseUrl,
      width: this.width,
      height: this.height
    };

    // Retrieve the existing settings from localStorage and add the new one
    const savedSettings = JSON.parse(localStorage.getItem('savedSettings') || '[]');
    savedSettings.push({ name: settingName, settings: userSettings });

    // Save all settings back to localStorage
    localStorage.setItem('savedSettings', JSON.stringify(savedSettings));

    // Refresh saved settings names and trigger change detection to update UI
    this.savedSettingNames = this.getSavedSettingNames();
    this.cdr.detectChanges();  // This triggers change detection immediately
  }


  protected loadUserSettings(settingName: string | undefined) {
    const savedSettings = JSON.parse(localStorage.getItem('savedSettings') || '[]');
    const selectedSetting = savedSettings.find((setting: { name: string, settings: any }) => setting.name === settingName);

    if (selectedSetting) {
      // Set the loaded values to the form
      this.username = selectedSetting.settings.username;
      this.password = selectedSetting.settings.password;
      this.templateId = selectedSetting.settings.templateId;
      this.baseUrl = selectedSetting.settings.baseUrl;
      this.width = selectedSetting.settings.width;
      this.height = selectedSetting.settings.height;
    }
  }


// Get the list of saved setting names from localStorage
  savedSettingNames: (NgIterable<unknown> & NgIterable<any>) | undefined | null;
  private getSavedSettingNames() {
    const savedSettings = JSON.parse(localStorage.getItem('savedSettings') || '[]');
    return savedSettings.map((setting: { name: string }) => setting.name);
  }
// Delete a saved setting by its index
  deleteSavedSetting(index: number) {
    // Retrieve the current saved settings from localStorage
    const savedSettings = JSON.parse(localStorage.getItem('savedSettings') || '[]');

    // Remove the setting at the given index
    savedSettings.splice(index, 1);

    // Save the updated list of settings back to localStorage
    localStorage.setItem('savedSettings', JSON.stringify(savedSettings));

    // Update the list of saved setting names
    this.savedSettingNames = this.getSavedSettingNames();
  }

}

