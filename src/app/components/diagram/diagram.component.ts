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
  }

  public showFlow(flow:string){

    this.resetVisibility();

    switch (flow){
      case "tokenization":
        this.iframeBoxVisible = "visible"
        this.iframeGenBoxVisible = "visible"
        break;
      case "detokenization":
        break;
      case "proxy":
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
