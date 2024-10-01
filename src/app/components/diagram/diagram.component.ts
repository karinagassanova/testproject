import {Component, EventEmitter, Injectable, Input, OnInit, Output} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'diagram',
  templateUrl: './diagram.component.html',
  styleUrls: ['diagram.component.css']
})
export class DiagramComponent implements OnInit {

  iframeBoxOutlineColor: string="black"
  iframeBoxVisible: string= "visible"
  iframeGenBoxOutlineColor: string="black"
  iframeGenBoxVisible: string= "visible"
  tokenizationBoxOutlineColor: string= "black"
  tokenizationBoxVisible: string="visible"
  cacheBoxOutlineColor: string="black"
  cacheBoxVisible: string="visible"
  clientprocserviceBoxOutlineColor: string="black"
  clientprocserviceBoxVisible: string="visible"
  detokenizationBoxOutlineColor: string="black"
  detokenizationBoxVisible="visible"
  proxyBoxOutlineColor: string="black"
  proxyBoxVisible: string="visible"
  thirdpartyBoxOutlineColor: string="black"
  thirdpartyBoxVisible: string="visible"

  lineproxydetokOutlineColor:string="black"
  lineproxydetokVisible:string="visible"

  lineiframetokenOutlineColor:string="black"
  lineiframetokenVisible="visible"

  arrowlineoneOutlineColor:string="black"
  arrowlineoneVisible:string="visible"
  arrowlinetwoOutlineColor:string="black"
  arrowlinetwoVisible:string="visible"
  arrowlinethreeOutlineColor: string="black"
  arrowlinethreeVisible: string="visible"
  arrowlinefiveOutlineColor:string="black"
  arrowlinefiveVisible:string="visible"
  arrowlinesixOutlineColor:string="black"
  arrowlinesixVisible:string="visible"
  arrowlinesevenOutlineColor: string ="black"
  arrowlinesevenVisible: string='visible'
  arrowlineeightOutlineColor:string="black"
  arrowlineeightVisible:string="visible"
  arrowlinenineOutlineColor: string="black"
  arrowlinenineVisible: string="visible"

  extradetokenizearrowBoxOutlineColor:string="black"
  extradetokenizearrowBoxVisible:string="hidden"

  proxytextVisible:string="visible"
  constructor() {
  }

  ngOnInit(): void {
  }

  public hideAll(){
    this.iframeBoxVisible = 'hidden'
    this.iframeGenBoxVisible = 'hidden'
    this.tokenizationBoxVisible= 'hidden'
    this.cacheBoxVisible='hidden'
    this.clientprocserviceBoxVisible='hidden'
    this.detokenizationBoxVisible='hidden'
    this.proxyBoxVisible='hidden'
    this.thirdpartyBoxVisible='hidden'

    this.lineproxydetokVisible='hidden'
    this.lineiframetokenVisible='hidden'

    this.arrowlineoneVisible='hidden'
    this.arrowlinetwoVisible='hidden'
    this.arrowlinethreeVisible='hidden'
    this.arrowlinefiveVisible='hidden'
    this.arrowlinesixVisible='hidden'
    this.arrowlinesevenVisible='hidden'
    this.arrowlineeightVisible='hidden'
    this.arrowlinenineVisible='hidden'

    this.extradetokenizearrowBoxVisible='hidden'
  }

  public resetVisibility(){
    this.iframeBoxVisible= "hidden"
    this.iframeGenBoxVisible= "hidden"
    this.tokenizationBoxVisible= 'hidden'
    this.cacheBoxVisible="hidden"
    this.clientprocserviceBoxVisible="hidden"
    this.detokenizationBoxVisible="hidden"
    this.proxyBoxVisible="hidden"
    this.thirdpartyBoxVisible="hidden"

    this.lineproxydetokVisible="hidden"
    this.lineiframetokenVisible="hidden"

    this.arrowlineoneVisible="hidden"
    this.arrowlinetwoVisible="hidden"
    this.arrowlinethreeVisible="hidden"
    this.arrowlinefiveVisible="hidden"
    this.arrowlinesixVisible="hidden"
    this.arrowlinesevenVisible="hidden"
    this.arrowlineeightVisible="hidden"
    this.arrowlinenineVisible="hidden"

    this.extradetokenizearrowBoxVisible="hidden"
  }

  public resetColour(){
    this.iframeBoxOutlineColor= "black"
    this.iframeGenBoxOutlineColor= "black"
    this.tokenizationBoxOutlineColor="black"
    this.cacheBoxOutlineColor="black"
    this.clientprocserviceBoxOutlineColor="black"
    this.detokenizationBoxOutlineColor="black"
    this.proxyBoxOutlineColor="black"
    this.thirdpartyBoxOutlineColor="black"

    this.lineproxydetokOutlineColor="black"
    this.lineiframetokenOutlineColor="black"

    this.arrowlineoneOutlineColor="black"
    this.arrowlinetwoOutlineColor="black"
    this.arrowlinethreeOutlineColor="black"
    this.arrowlinefiveOutlineColor="black"
    this.arrowlinesixOutlineColor="black"
    this.arrowlinesevenOutlineColor="black"
    this.arrowlineeightOutlineColor="black"
    this.arrowlinenineOutlineColor="black"

    this.extradetokenizearrowBoxOutlineColor="black"
  }

  public showFlow(flow:string){

    this.resetVisibility();

    switch (flow){
      case "tokenization":
        this.iframeBoxVisible = "visible"
        this.iframeGenBoxVisible = "visible"
        this.tokenizationBoxVisible="visible"
        this.cacheBoxVisible="visible"
        this.clientprocserviceBoxVisible="visible"
        this.arrowlineoneVisible="visible"
        this.arrowlinetwoVisible="visible"
        this.arrowlinethreeVisible="visible"
        this.lineiframetokenVisible="visible"

        break;
      case "detokenization":
        this.iframeBoxVisible = "visible"
        this.iframeGenBoxVisible = "visible"
        this.tokenizationBoxVisible="visible"
        this.cacheBoxVisible="visible"
        this.clientprocserviceBoxVisible="visible"
        this.detokenizationBoxVisible="visible"
        this.arrowlineoneVisible="visible"
        this.arrowlinetwoVisible="visible"
        this.arrowlinethreeVisible="visible"
        this.lineiframetokenVisible="visible"
        this.arrowlinefiveVisible="visible"
        this.arrowlinesixVisible="visible"
        this.arrowlinesevenVisible="visible"
        this.extradetokenizearrowBoxVisible="visible"
        break;
      case "proxy":
        this.iframeBoxVisible = "visible"
        this.iframeGenBoxVisible = "visible"
        this.tokenizationBoxVisible="visible"
        this.cacheBoxVisible="visible"
        this.clientprocserviceBoxVisible="visible"
        this.proxyBoxVisible="visible"
        this.thirdpartyBoxVisible="visible"
        this.detokenizationBoxVisible="visible"
        this.arrowlineoneVisible="visible"
        this.arrowlinetwoVisible="visible"
        this.arrowlinethreeVisible="visible"
        this.lineiframetokenVisible="visible"
        this.arrowlinefiveVisible="visible"
        this.arrowlinesixVisible="visible"
        this.arrowlinesevenVisible="visible"
        this.lineproxydetokVisible="visible"
        this.arrowlineeightVisible="visible"
        this.arrowlinenineVisible="visible"
        break;
    }
  }

  public highlight(state:string){

    this.resetColour()

    switch (state){
      case "show_iframe":
        this.iframeBoxOutlineColor= "orange"
        this.iframeGenBoxOutlineColor="orange"
        break;
      case "tokenize":
        this.iframeBoxOutlineColor= "orange"
        this.iframeGenBoxOutlineColor="orange"
        this.tokenizationBoxOutlineColor="orange"
        this.cacheBoxOutlineColor="orange"
        break;
      case "detokenize" :
        this.clientprocserviceBoxOutlineColor="orange"
        this.detokenizationBoxOutlineColor="orange"
        break;
      case "sendto_server" :
        this.iframeBoxOutlineColor = "orange"
        this.clientprocserviceBoxOutlineColor = "orange"
        this.cacheBoxOutlineColor = "orange"
        break;
      case "view_tokens" :
        this.clientprocserviceBoxOutlineColor="orange"
        break;
      case "proxy" :
        this.proxyBoxOutlineColor ="orange"
        this.clientprocserviceBoxOutlineColor="orange"
        this.detokenizationBoxOutlineColor="orange"
        this.thirdpartyBoxOutlineColor="orange"
        break;
    }
  }

}
