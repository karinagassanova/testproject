import {Component, EventEmitter, Injectable, Input, OnInit, Output, ViewChild} from "@angular/core";
import {DiagramComponent} from "../diagram/diagram.component";

@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'buttons',
  templateUrl: './buttons.component.html',
  styleUrls: ['buttons.component.css']
})
export class ButtonsComponent implements OnInit {

  constructor(private diagramComponent : DiagramComponent) {
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
    console.log("showFlow")

    this.diagramComponent.showFlow(flow)
  }

  public highlight(state:string){
    console.log("highlight")

    this.diagramComponent.highlight(state)
  }

}
