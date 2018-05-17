import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";

@Component({
  selector: 'app-lamp',
  templateUrl: './lamp.component.html',
  styleUrls: ['./lamp.component.css']
})
export class LampComponent implements OnInit {
  socket: WebSocket;

  dimLevel = '50';
  dimDuration = '1000';

  currentDimLevel = this.dimLevel;
  onState = true;
  overheated = false;

  constructor(private http: HttpClient) { }


  ngOnInit() {
    this.socket = new WebSocket('ws://localhost:8888/0', 'webthing');

    this.socket.onmessage = (msg) => {
      console.log(JSON.parse(msg.data));
    };

    this.refreshDimLevelAndOnState();
    setTimeout(() => this.subscribeOnEvent(), 0);
  }


  dim() {
    this.socket.send(JSON.stringify({
      'messageType': 'requestAction',
      'data': {
        'fade': {
          'input': {
            'level': parseInt(this.dimLevel),
            'duration': parseInt(this.dimDuration)
          }
        }
      }
    }));
  }


  changeState() {
    this.http.get('http://localhost:8888/0/properties/on').subscribe(
      val1 => {
        const anyVal1 = <any> val1;
        this.http.put('http://localhost:8888/0/properties/on', {'on': !anyVal1.on})
          .subscribe(() => {});
      }
    );
  }


  subscribeOnEvent() {
    this.socket.send(JSON.stringify({
      'messageType': 'addEventSubscription',
      'data': {
        'overheated': {}
      }
    }));
  }


  refreshDimLevelAndOnState() {
    setInterval(() => {
      this.http.get('http://localhost:8888/0/properties/level').subscribe(
        value => {
          const anyValue = <any> value;
          this.currentDimLevel = anyValue.level;
        }
      );

      this.http.get('http://localhost:8888/0/properties/on').subscribe(
        value => {
          const anyValue = <any> value;
          this.onState = anyValue.on;
        }
      );
    }, 1000);
  }
}
