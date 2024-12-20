import {Component, OnInit, OnDestroy, Injectable, NgIterable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Subscription} from 'rxjs';
import {DiagramComponent} from "./components/diagram/diagram.component";
import {SharedService} from "./services/sharedservice";
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {NgbdModalContent} from './components/modal/modal-component'; // Adjust the path accordingly
import {NgbdDetokenModalContent} from './components/modal/modal-detok-component';
import {ChangeDetectorRef} from '@angular/core';
import {ProxyConfigComponent} from "./components/proxy/proxy-config-component";


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
  data: TokenResponse[];
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

  username: string = '';
  password: string = '';
  templateId: string = '';
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
  db: Database = {
    data: []
  };

  flow: string = 'all';
  settingName: string | undefined;

  showFlow(selectedFlow: string) {
    this.flow = selectedFlow; // Update flow based on button clicks
  }

  constructor(
    private http: HttpClient,
    private sharedService: SharedService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {

    this.messageSubscription = new Subscription();
    window.addEventListener('message', this.onMessage.bind(this));
    this.savedSettingNames = this.getSavedSettingNames();

  }

  ngOnDestroy() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    window.removeEventListener('message', this.onMessage.bind(this));
  }

  private destroyIFrame(parentId: string) {
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
      this.tempTokenData = {token};

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


  onDetokenizeButtonClick(id: string) {

    const tokenData = this.db.data.find(item => item.bfid === id);

    if (tokenData) {
      this.sharedService.highlightMessage.next("detokenize");
      const bfid = tokenData.bfid; // Fetch BFID from the read response
      const values = tokenData.values // Values that need to be detokenized
      const username = this.username;
      const password = this.password;
      this.flow = 'detokenization';

      console.log({bfid, values, username, password});

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
      const body = {
        bfid: bfid,
        values: values,
        username: username,
        password: password
      }
      this.http.post<DetokenizeResponse>(
        'https://st3nuq5s37.execute-api.us-east-1.amazonaws.com/token/detokenize',
        body,
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
          this.openDetokenizedModal(this.detokenizedData, body);
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

  openDetokenizedModal(detokenizedData: any[], tokenData: any) {
    const modalRef = this.modalService.open(NgbdDetokenModalContent, {size: "lg"});
    modalRef.componentInstance.detokenizedData = detokenizedData;
    modalRef.componentInstance.tokenData = tokenData;
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
      this.cdr.detectChanges();
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
    const modalRef = this.modalService.open(NgbdModalContent, {size: 'lg'});
    modalRef.componentInstance.tokenResponse = tokenData;
  }

  isConfigFolded = false;

  toggleConfigFold() {
    this.isConfigFolded = !this.isConfigFolded;
  }

  iframeOutlineColor: string = 'black';
  isTabsFolded: boolean = false;
  isIframeFolded: boolean = false;

  toggleIframeFold() {
    this.isIframeFolded = !this.isIframeFolded;
  }


  protected saveUserSettings() {
    const settingName = this.settingName || 'Default Setting';


    const userSettings = {
      username: this.username,
      password: this.password,
      templateId: this.templateId,
      baseUrl: this.baseUrl,
      width: this.width,
      height: this.height
    };


    const savedSettings = JSON.parse(localStorage.getItem('savedSettings') || '[]');
    savedSettings.push({name: settingName, settings: userSettings});
    localStorage.setItem('savedSettings', JSON.stringify(savedSettings));


    this.savedSettingNames = this.getSavedSettingNames();
    this.cdr.detectChanges();
  }


  protected loadUserSettings(settingName: string | undefined) {
    const savedSettings = JSON.parse(localStorage.getItem('savedSettings') || '[]');
    const selectedSetting = savedSettings.find((setting: {
      name: string,
      settings: any
    }) => setting.name === settingName);

    if (selectedSetting) {

      this.username = selectedSetting.settings.username;
      this.password = selectedSetting.settings.password;
      this.templateId = selectedSetting.settings.templateId;
      this.baseUrl = selectedSetting.settings.baseUrl;
      this.width = selectedSetting.settings.width;
      this.height = selectedSetting.settings.height;
    }
  }


  savedSettingNames: (NgIterable<unknown> & NgIterable<any>) | undefined | null;

  private getSavedSettingNames() {
    const savedSettings = JSON.parse(localStorage.getItem('savedSettings') || '[]');
    return savedSettings.map((setting: { name: string }) => setting.name);
  }


  deleteSavedSetting(settingName: string | undefined) {
    if (!settingName) {
      return;
    }
    const savedSettings = JSON.parse(localStorage.getItem('savedSettings') || '[]');
    const index = savedSettings.findIndex((setting: any) => setting.name === settingName);
    if (index === -1) {
      return;
    }
    savedSettings.splice(index, 1);


    localStorage.setItem('savedSettings', JSON.stringify(savedSettings));
    this.savedSettingNames = this.getSavedSettingNames();
    this.cdr.detectChanges();
  }

  onProxyButtonClick(bfid: string) {
    console.log(`Proxy button clicked for BFID: ${bfid}`);
    this.flow = 'proxy';
    this.sharedService.highlightMessage.next("proxy");
    const tokenData = this.db.data.find(item => item.bfid === bfid);

    const data = {
      url: this.baseUrl.replace("secure", "proxy"),
      username: this.username,
      password: this.password,
      headers: JSON.stringify({'scx-bfid': tokenData?.bfid}, null, 4),
      payload: "",
      substituteData: JSON.stringify(tokenData, null, 4),
      proxyResponse: ""
    }

    this.sharedService.loadInProxy.next(data);
  }

  isFullscreen = false; // Track fullscreen state
  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen; // Toggle fullscreen mode
  }

  toggleFullscreen2(): void {
    const diagramContainer = document.getElementById('diagramContainer');
    const diagramDescription = document.querySelector('.diagram-description') as HTMLElement;
    const diagram = document.querySelector('.diagram') as HTMLElement;

    if (this.isFullscreen) {
      // Exit fullscreen mode
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }

      // Reset the diagram size
      this.resizeDiagram(false);

      // No need to hide the description anymore, so we leave it as is
      diagramDescription.style.display = ''; // Keep the description visible when exiting fullscreen
    } else {
      // Enter fullscreen mode
      if (diagramContainer?.requestFullscreen) {
        diagramContainer.requestFullscreen();
      }

      // Resize the diagram to fullscreen size
      this.resizeDiagram(true);

      // Keep the diagram description visible in fullscreen mode
      diagramDescription.style.display = ''; // Keep it visible, no need to hide it
    }

    // Toggle the fullscreen state
    this.isFullscreen = !this.isFullscreen;
  }

// Helper function to resize the diagram
  resizeDiagram(isFullscreen: boolean): void {
    const diagram = document.querySelector('.diagram') as HTMLElement;

    if (isFullscreen) {
      // Set the diagram's width and height when entering fullscreen
      diagram.style.width = '800px'; // Set width to 800px (you can adjust this as needed)
      diagram.style.height = '500px'; // Set height to 500px (you can adjust this as needed)
    } else {
      // Reset the diagram's width and height to default
      diagram.style.width = ''; // Reset to default width (auto or 100%)
      diagram.style.height = ''; // Reset to default height (auto or 100%)
    }
  }
}
