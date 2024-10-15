import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";

@Injectable()
export class SharedService{
  isVisibleMessage: BehaviorSubject<boolean> = new BehaviorSubject(true)
  highlightMessage: BehaviorSubject<string> = new BehaviorSubject("")
  showFlowMessage: BehaviorSubject<string> = new BehaviorSubject("proxy")
  constructor() {
  }
}
