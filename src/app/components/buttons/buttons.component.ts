import {Component, EventEmitter, Injectable, Input, OnInit, Output, ViewChild} from "@angular/core";
import {DiagramComponent} from "../diagram/diagram.component";
import {SharedService} from "../../services/sharedservice";

@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'buttons',
  templateUrl: './buttons.component.html',
  styleUrls: ['buttons.component.css']
})
export class ButtonsComponent implements OnInit {

  constructor(private diagramComponent : DiagramComponent, private sharedService :SharedService) {
  }

  ngOnInit(): void {
  }

  public hideAll(){
  }

  public resetVisibility(){
  }

  public resetColour(){
  }

  public showFlow(flow:string){
    this.sharedService.showFlowMessage.next(flow)
  }

  public highlight(state:string){
    this.sharedService.highlightMessage.next(state)
  }

}
