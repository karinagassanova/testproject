import {Component, inject, Injectable, Input, OnInit} from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {SharedService} from "../../services/sharedservice";
import {TokenResponse} from "../../app.component";
import {firstValueFrom} from "rxjs";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";  // Import HttpClient


type SavedConfig = {
  configId: string;
  proxyId: string;
  partner: string;
  headers: string;
  name: string;
  url: string,
  username: string,
  password :string,
  payload: string
}

@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'app-proxy-config',
  templateUrl: './proxy.html',
  styleUrls: ['./proxy.css']
})
export class ProxyConfigComponent implements OnInit {
  clipboard = inject(Clipboard); // Inject Clipboard service
  scxPartnerId: string = '';
  proxyId: string = ""
  url: string = ""
  username: string = ""
  password: string = ""
  @Input() payload: string = "";
  @Input() headers: string = "";
  @Input() substituteData: string = "";

  proxyResponse: HttpResponse<any> | undefined = undefined;

  activeTab = 1; // Default active tab is 1 (Edit Configuration)
  savedConfigs: Array<SavedConfig> = [];
  saveConfigName: string = '';
  selectedConfigId: string = '';
  isConfigVisible: boolean = true; // Controls the visibility of the config section
  isDestinationUrlSet: boolean = false; // Controls the visibility of the config section
  isFullscreen = false; // Track fullscreen state

  destinationUrl: string = ""
  safeDestinationUrl: SafeResourceUrl = ""

  constructor(private http: HttpClient, private sharedService: SharedService, private domSanitizer: DomSanitizer) {
  }

  ngOnInit() {
    this.loadAllConfigs(); // Load all configurations on init


    this.sharedService.loadInProxy.subscribe((mess) => {
      if (mess.id){
        this.proxyId = mess.id
      }
      if (mess.url){
        this.url = mess.url
      }
      if (mess.payload){
        this.payload = mess.payload
      }
      if (mess.headers){
        this.headers = mess.headers
      }
      if (mess.username){
        this.username = mess.username
      }
      if (mess.password){
        this.password = mess.password
      }
      if (mess.substituteData){
        this.substituteData = mess.substituteData
      }
    })
  }

  saveConfig() {
    if (!this.saveConfigName.trim()) {
      alert('Please enter a name for the configuration!');
      return;
    }

    const index = this.savedConfigs.findIndex(config => config.name === this.saveConfigName.trim());

    if (index !== -1) {
      const deletedConfig = this.savedConfigs.splice(index, 1)[0];
    }

    const newConfig = {
      configId: Date.now().toString(), // Unique ID for each config
      name: this.saveConfigName.trim(),
      partner: this.scxPartnerId.trim(),
      headers: this.headers.trim(),
      proxyId: this.proxyId,
      url: this.url,
      username: this.username,
      password: this.password,
      payload: this.payload,
    };

    this.savedConfigs.push(newConfig);
    localStorage.setItem('proxyConfigs', JSON.stringify(this.savedConfigs));
    alert(`Configuration "${this.saveConfigName}" saved successfully!`);
    this.saveConfigName = ''; // Clear the input
  }


  loadSelectedConfig() {
    const conf = this.savedConfigs.find(config => config.configId === this.selectedConfigId);
    if (conf) {
      this.saveConfigName = conf.name
      this.url = conf.url
      this.proxyId = conf.proxyId
      this.scxPartnerId = conf.partner
      this.headers = conf.headers
      this.payload = conf.payload
      this.username = conf.username
      this.password = conf.password
    } else {
      alert('No configuration selected or found.');
    }
  }

  loadAllConfigs() {
    const saved = localStorage.getItem('proxyConfigs');
    if (saved) {
      this.savedConfigs = JSON.parse(saved);
    } else {
      this.savedConfigs = [];
    }
  }

  deleteSelectedConfig() {
    const index = this.savedConfigs.findIndex(config => config.configId === this.selectedConfigId);
    if (index !== -1) {
      const deletedConfig = this.savedConfigs.splice(index, 1)[0];
      localStorage.setItem('proxyConfigs', JSON.stringify(this.savedConfigs));
      alert(`Configuration "${deletedConfig.name}" deleted successfully!`);
      this.selectedConfigId = ''; // Clear the selection
    } else {
      alert('No configuration selected to delete.');
    }
  }

  sendRequest() {
    this.activeTab = 2; // Switch to the "Request" tab
  }

  copyToClipboard(data: string): void {
    this.clipboard.copy(data);
    alert('Copied to clipboard!');
  }

  getReqHeaders() : any {

    const defaultHeaders = {
      Accept: 'application/json',
 //s     Authorization: `${this.generateProxyAuth}`,
      'Content-Type': 'application/json',
    }

    const uiHeaders = JSON.parse(this.headers || '{}')

    const allHeaders = {...defaultHeaders, ...uiHeaders}

    if (!allHeaders['Authorization'] && !allHeaders['authorization']){
      allHeaders['Authorization'] = `${this.generateProxyAuth}`
    }

    return allHeaders
  }

  async makeProxyCall() {
    // Clear previous response data before making a new request
    this.proxyResponse = undefined;

    const defaultHeaders = this.getReqHeaders();

    const proxyHeaders = {target: `${this.proxyUrl}`};

    const allHeaders = {...defaultHeaders, ...proxyHeaders};

    try {
      const response: HttpResponse<any> = await firstValueFrom(
        this.http.post<any>(
          `https://5h1t6xmh5m.execute-api.us-east-1.amazonaws.com/test/api/v1/partners/${this.scxPartnerId}/configurations/${this.proxyId}`,
          this.formattedProxyData(),
          {
            headers: new HttpHeaders(allHeaders),
            observe: 'response',
          }
        )
      );
      this.proxyResponse = response;
      console.log("Response", response);
    } catch (error) {
      console.error("Error during proxy call", error);
      alert('Error occurred during the proxy call');
    }
  }

  get responseCode(): string{
    if (this.proxyResponse) {
      return JSON.stringify(this.proxyResponse.status, null, 4)
    }
    return ""
  }

  get responseHeaders(): string{
    if (this.proxyResponse) {
      const headerObj: Record<string, string | string[]> = {};
      this.proxyResponse.headers.keys().forEach((key) => {
        if (this.proxyResponse){
          headerObj[key] = this.proxyResponse.headers.getAll(key) || this.proxyResponse.headers.get(key) || '';
        }
      });
      return JSON.stringify(headerObj, null, 4)
    }
    return ""
  }

  get responseBody(): string{
    if (this.proxyResponse) {
      return JSON.stringify(this.proxyResponse.body, null, 4)
    }
    return ""
  }

  get proxyUrl(): string {
    return this.url || '';
  }

  get generateProxyAuth(): string {
    return 'Basic ' + btoa(`${this.username}:${this.password}`);
  }

  get formattedCurlRequest(): string {
    const fullUrl = `${this.proxyUrl}/api/v1/partners/${this.scxPartnerId}/configurations/${this.proxyId}`;
    return `curl --location '${fullUrl}' \\
${this.formattedHeaders}--data '${this.formattedProxyDataAsString}'`;
  }

  get formattedHeaders(): string {
    const headers = this.getReqHeaders();
    let h = ''
    for ( let i in headers){
      h += "--header '" + i + ": " + headers[i] + "' \\\n"
    }
    return h;
  }

  formattedProxyData(): string {
    const pl = JSON.parse(this.payload || '{}');
    const scx = JSON.parse(this.substituteData || '{}');
    const body = this.recursiveSubstitute(pl, scx.values || []);
    return body;
  }

  get formattedProxyDataAsString(): string {
    return JSON.stringify(this.formattedProxyData(), null, 4).replace(/\\n/g, '\n').replace(/\\"/g, '"');
  }

  recursiveSubstitute(target: any, arr: any[]): any {
    if (typeof target === 'object' && target !== null) {
      if (Array.isArray(target)) {
        return target.map(item => this.recursiveSubstitute(item, arr));
      } else {
        const result: any = {};
        for (const key in target) {
          result[key] = this.recursiveSubstitute(target[key], arr);
        }
        return result;
      }
    } else if (typeof target === 'string' && target.startsWith('$')) {
      return this.getReplacementValue(target.slice(1), arr);
    }
    return target;
  }

  getReplacementValue(key: string, array: any[]): any {
    const item = array.find(entry => entry.name === key);
    return item ? item.value : `$${key}`;
  }

  toggleConfigVisibility() {
    this.isConfigVisible = !this.isConfigVisible; // Toggle visibility of the configuration section
  }

  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
  }

  loadDestinationUrl() {
    this.safeDestinationUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.destinationUrl);
    this.isDestinationUrlSet = true;
  }

  clearDestinationUrl() {
    this.safeDestinationUrl = "";
    this.isDestinationUrlSet = false;
  }
}
