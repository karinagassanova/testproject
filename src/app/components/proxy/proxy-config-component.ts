import {Component, inject, Injectable, Input, OnInit} from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {SharedService} from "../../services/sharedservice";
import {TokenResponse} from "../../app.component";  // Import HttpClient


type SavedConfig = {
  configId: string;
  proxyId: string;
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
  private httpClient = inject(HttpClient); // Inject HttpClient

  proxyId: string = ""
  url: string = ""
  username: string = ""
  password: string = ""
  @Input() payload: string = "";
  @Input() headers: string = "";
  @Input() substituteData: string = "";
  @Input() proxyResponse: string = "";

  activeTab = 1; // Default active tab is 1 (Edit Configuration)
  savedConfigs: Array<SavedConfig> = [];
  saveConfigName: string = '';
  selectedConfigId: string = '';
  isConfigVisible: boolean = true; // Controls the visibility of the config section


  constructor(private http: HttpClient, private sharedService: SharedService) {
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
      if (mess.proxyResponse){
        this.proxyResponse = mess.proxyResponse
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

  loadAllConfigs() {
    const saved = localStorage.getItem('proxyConfigs');
    if (saved) {
      this.savedConfigs = JSON.parse(saved);
    } else {
      this.savedConfigs = [];
    }
  }

  loadSelectedConfig() {
    const conf = this.savedConfigs.find(config => config.configId === this.selectedConfigId);
    if (conf) {
      this.saveConfigName = conf.name
      this.url = conf.url
      this.proxyId = conf.proxyId
      this.payload = conf.payload
      this.username = conf.username
      this.password = conf.password
    } else {
      alert('No configuration selected or found.');
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
    data = data.replace(/\n/g," ").replace(/\r/g," ")
    this.clipboard.copy(data);
    alert('Copied to clipboard!');
  }

  makeProxyCall(): void{
    this.http.post<TokenResponse>(
      `${this.proxyUrl}`,
      this.formattedProxyData(),
      {
        headers: new HttpHeaders({
          Accept: 'application/json',
          Authorization: `${this.generateProxyAuth}'`,
          'scx-bfid' : 'djI6MTIwMjQxMTE1MTA0OTEzMTAzMTUzNzQ2MnxlMzJjOTU3ZmI4M2E5ZTAzNDcyZjIzMjA3ZWRlNWVlMHx8fA==',
          'Content-Type': 'application/json'
        })
      }
    ).subscribe(
      (response) => {
        console.log('Received Tokenized Data:', response);
      },
      (error) => {
        console.error('Error retrieving tokens:', error);
      }
    );
  }

  get proxyUrl(): string {
    return this.url || 'https://example.com/api/proxy';
  }

  get generateProxyAuth(): string {
    return 'Basic ' + btoa(`${this.username}:${this.password}`);
  }

  get formattedCurlRequest(): string {
    const fullUrl = `${this.proxyUrl}/api/v1/partners/${this.username}/configurations/${this.proxyId}`;
    return `curl --location '${fullUrl}'
--header 'Content-Type: application/json'
--header 'Authorization: ${this.generateProxyAuth}'
${this.formattedHeaders}
--data '${this.formattedProxyDataAsString}'`;
  }

  get formattedHeaders(): string {
    const headers = JSON.parse(this.headers || '[]');
    let h = ''
    for ( let i = 0; i < headers.length; i++){
      h += "--header " + headers[i]
    }
    return h;
  }

  formattedProxyData(): string {
    const pl = JSON.parse(this.payload || '{}');
    const scx = JSON.parse(this.substituteData || '{}');
    const body = this.recursiveSubstitute(pl, scx.values || []);
    return body
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
}