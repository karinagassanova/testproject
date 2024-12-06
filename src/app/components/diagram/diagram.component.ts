import {ChangeDetectorRef, Component, EventEmitter, Injectable, Input, OnInit, Output} from "@angular/core";
import {SharedService} from "../../services/sharedservice";

@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'diagram',
  templateUrl: './diagram.component.html',
  styleUrls: ['diagram.component.css']
})
export class DiagramComponent implements OnInit {

  visibility: boolean = true

  flow: string = 'all'

  iframeBoxOutlineColor: string = "white"
  iframeBoxVisible: string = "visible"
  iframeGenBoxOutlineColor: string = "white"
  iframeGenBoxVisible: string = "visible"
  tokenizationBoxOutlineColor: string = "white"
  tokenizationBoxVisible: string = "visible"
  cacheBoxOutlineColor: string = "white"
  cacheBoxVisible: string = "visible"
  clientprocserviceBoxOutlineColor: string = "white"
  clientprocserviceBoxVisible: string = "visible"
  detokenizationBoxOutlineColor: string = "white"
  detokenizationBoxVisible = "visible"
  proxyBoxOutlineColor: string = "white"
  proxyBoxVisible: string = "visible"
  thirdpartyBoxOutlineColor: string = "white"
  thirdpartyBoxVisible: string = "visible"
  lineproxydetokOutlineColor: string = "black"
  lineproxydetokVisible: string = "visible"
  lineiframetokenOutlineColor: string = "black"
  lineiframetokenVisible: string = "visible"
  linedetokboxOutlineColor: string = "black"
  linedetokboxVisible: string = "visible"
  arrowlineoneOutlineColor: string = "black"
  arrowlineoneVisible: string = "visible"
  arrowlinetwoOutlineColor: string = "black"
  arrowlinetwoVisible: string = "visible"
  arrowlinethreeOutlineColor: string = "black"
  arrowlinethreeVisible: string = "visible"
  arrowlinefiveOutlineColor: string = "black"
  arrowlinefiveVisible: string = "visible"
  arrowlinesixOutlineColor: string = "black"
  arrowlinesixVisible: string = "visible"
  arrowlinesevenOutlineColor: string = "black"
  arrowlinesevenVisible: string = 'visible'
  arrowlineeightOutlineColor: string = "black"
  arrowlineeightVisible: string = "visible"
  arrowlinenineOutlineColor: string = "black"
  arrowlinenineVisible: string = "visible"
  detokflowlineOutlineColor: string = "black"
  detokflowlineVisible: string = "hidden"
  browserlineOutlineColor:string="grey"
  browserlineVisible:string="visible"

  proxyarrowoneOutlineColor:string= "black"
  proxyarrowoneVisible:string="visible"
  proxyarrowtwoVisible:string="visible"
  proxyarrowtwoOutlineColor:string="black"

  bigboxOutlineColor:string="blue"
  bigboxVisible:string="visible"

  bigboxtextOutlineColor:string="black"
  bigboxtextVisible:string="visible"



  constructor(private cdr: ChangeDetectorRef, private sharedService: SharedService) {

  }

  displayText: string = '';

  ngOnInit(): void {
    this.sharedService.highlightMessage.subscribe((mess) => {
      console.log('mess', mess)
      this.highlight(mess)
    })
    this.sharedService.showFlowMessage.subscribe((mess) => {
      console.log('mess', mess)
      this.showFlow(mess)
    })
    this.sharedService.isVisibleMessage.subscribe(val => {
      this.visibility = val
    })
  }

  public hideAll() {
    this.iframeBoxVisible = 'hidden'
    this.iframeGenBoxVisible = 'hidden'
    this.tokenizationBoxVisible = 'hidden'
    this.cacheBoxVisible = 'hidden'
    this.clientprocserviceBoxVisible = 'hidden'
    this.detokenizationBoxVisible = 'hidden'
    this.proxyBoxVisible = 'hidden'
    this.thirdpartyBoxVisible = 'hidden'
    this.lineproxydetokVisible = 'hidden'
    this.lineiframetokenVisible = 'hidden'
    this.linedetokboxVisible = 'hidden'
    this.arrowlineoneVisible = 'hidden'
    this.arrowlinetwoVisible = 'hidden'
    this.arrowlinethreeVisible = 'hidden'
    this.arrowlinefiveVisible = 'hidden'
    this.arrowlinesixVisible = 'hidden'
    this.arrowlinesevenVisible = 'hidden'
    this.arrowlineeightVisible = 'hidden'
    this.arrowlinenineVisible = 'hidden'
    this.detokflowlineVisible = 'hidden'
    this.browserlineVisible='hidden'
    this.proxyarrowoneVisible='hidden'
    this.proxyarrowtwoVisible='hidden'
    this.bigboxVisible='hidden'
    this.bigboxtextVisible='hidden'
  }

  public resetVisibility() {
    this.iframeBoxVisible = "hidden"
    this.iframeGenBoxVisible = "hidden"
    this.tokenizationBoxVisible = 'hidden'
    this.cacheBoxVisible = "hidden"
    this.clientprocserviceBoxVisible = "hidden"
    this.detokenizationBoxVisible = "hidden"
    this.proxyBoxVisible = "hidden"
    this.thirdpartyBoxVisible = "hidden"
    this.lineproxydetokVisible = "hidden"
    this.lineiframetokenVisible = "hidden"
    this.linedetokboxVisible = "hidden"
    this.arrowlineoneVisible = "hidden"
    this.arrowlinetwoVisible = "hidden"
    this.arrowlinethreeVisible = "hidden"
    this.arrowlinefiveVisible = "hidden"
    this.arrowlinesixVisible = "hidden"
    this.arrowlinesevenVisible = "hidden"
    this.arrowlineeightVisible = "hidden"
    this.arrowlinenineVisible = "hidden"
    this.detokflowlineVisible = "hidden"
    this.browserlineVisible="hidden"
    this.proxyarrowoneVisible="hidden"
    this.proxyarrowtwoVisible="hidden"
    this.bigboxVisible="hidden"
    this.bigboxtextVisible="hidden"
  }

  public resetColour() {
    this.iframeBoxOutlineColor = "white"
    this.iframeGenBoxOutlineColor = "white"
    this.tokenizationBoxOutlineColor = "white"
    this.cacheBoxOutlineColor = "white"
    this.clientprocserviceBoxOutlineColor = "white"
    this.detokenizationBoxOutlineColor = "white"
    this.proxyBoxOutlineColor = "white"
    this.thirdpartyBoxOutlineColor = "white"
    this.lineproxydetokOutlineColor = "black"
    this.lineiframetokenOutlineColor = "black"
    this.linedetokboxOutlineColor = "black"
    this.arrowlineoneOutlineColor = "black"
    this.arrowlinetwoOutlineColor = "black"
    this.arrowlinethreeOutlineColor = "black"
    this.arrowlinefiveOutlineColor = "black"
    this.arrowlinesixOutlineColor = "black"
    this.arrowlinesevenOutlineColor = "black"
    this.arrowlineeightOutlineColor = "black"
    this.arrowlinenineOutlineColor = "black"
    this.detokflowlineOutlineColor = "black"
    this.browserlineOutlineColor="grey"
    this.proxyarrowoneOutlineColor="black"
    this.proxyarrowtwoOutlineColor="black"
    this.bigboxOutlineColor="blue"
    this.bigboxtextOutlineColor="grey"
  }

  public showFlow(flow: string) {

    console.log("diagram.showFlow")
    this.resetVisibility();
    this.flow=flow

    switch (flow) {
      case "tokenization":
        this.arrowlinefiveVisible = "visible"
        this.iframeBoxVisible = "visible"
        this.iframeGenBoxVisible = "visible"
        this.tokenizationBoxVisible = "visible"
        this.cacheBoxVisible = "visible"
        this.clientprocserviceBoxVisible = "visible"
        this.arrowlineoneVisible = "visible"
        this.arrowlinetwoVisible = "visible"
        this.arrowlinethreeVisible = "visible"
        this.lineiframetokenVisible = "visible"
        this.browserlineVisible="visible"
        break;
      case "detokenization":
        this.clientprocserviceBoxVisible = "visible"
        this.detokenizationBoxVisible = "visible"
        this.detokflowlineVisible = "visible"
        break;
      case "all":
        this.iframeBoxVisible = "visible"
        this.iframeGenBoxVisible = "visible"
        this.tokenizationBoxVisible = "visible"
        this.cacheBoxVisible = "visible"
        this.clientprocserviceBoxVisible = "visible"
        this.proxyBoxVisible = "visible"
        this.thirdpartyBoxVisible = "visible"
        this.detokenizationBoxVisible = "visible"
        this.arrowlineoneVisible = "visible"
        this.arrowlinetwoVisible = "visible"
        this.arrowlinethreeVisible = "visible"
        this.lineiframetokenVisible = "visible"
        this.linedetokboxVisible = "visible"
        this.arrowlinefiveVisible = "visible"
        this.arrowlinesixVisible = "visible"
        this.arrowlinesevenVisible = "visible"
        this.lineproxydetokVisible = "visible"
        this.arrowlineeightVisible = "visible"
        this.arrowlinenineVisible = "visible"
        this.browserlineVisible="visible"
        break;
      case "proxy":
        this.proxyarrowoneVisible="visible"
        this.thirdpartyBoxVisible = "visible"
        this.clientprocserviceBoxVisible = "visible"
        this.proxyBoxVisible = "visible"
        this.proxyarrowtwoVisible="visible"
        this.bigboxVisible="visible"
        break;
    }
    this.cdr.detectChanges()
  }


  public highlight(state: string) {

    console.log("diagram.highlight")
    this.resetColour()

    switch (state) {
      case "show_iframe":
        this.iframeBoxOutlineColor = "orange"
        this.iframeGenBoxOutlineColor = "orange"
        this.showFlow("tokenization")
        break;
      case "tokenize":
        this.iframeBoxOutlineColor = "orange"
        this.iframeGenBoxOutlineColor = "orange"
        this.tokenizationBoxOutlineColor = "orange"
        this.cacheBoxOutlineColor = "orange"
        this.showFlow("tokenization")
        break;
      case "detokenize" :
        this.clientprocserviceBoxOutlineColor = "orange"
        this.detokenizationBoxOutlineColor = "orange"
        this.showFlow("detokenization")
        break;
      case "sendto_server" :
        this.iframeBoxOutlineColor = "orange"
        this.clientprocserviceBoxOutlineColor = "orange"
        this.cacheBoxOutlineColor = "orange"
        this.showFlow("all")
        break;
      case "view_tokens" :
        this.clientprocserviceBoxOutlineColor = "orange"
        this.showFlow("tokenization")
        break;
      case "proxy" :
        this.proxyBoxOutlineColor = "orange"
        this.bigboxtextOutlineColor="orange"
        this.bigboxOutlineColor="orange"
        this.bigboxOutlineColor="orange"
        this.thirdpartyBoxOutlineColor="orange"
        this.clientprocserviceBoxOutlineColor="orange"
        this.showFlow("proxy")
        break;
    }

    this.cdr.detectChanges()
  }

}
