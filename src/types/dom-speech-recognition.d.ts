// Type definitions for Web Speech API
// Project: https://wicg.github.io/speech-api/
// Definitions by: Tudor Anghelina <https://github.com/Tudor-Anghelina>
//                 Yosuke Kurami <https://github.com/yosuke-kurami>
//                 Jan Kuehle <https://github.com/jankuehle>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare global {
  interface SpeechRecognitionEventMap {
    audioend: Event;
    audiostart: Event;
    end: Event;
    error: SpeechRecognitionErrorEvent;
    nomatch: SpeechRecognitionEvent;
    result: SpeechRecognitionEvent;
    soundend: Event;
    soundstart: Event;
    speechend: Event;
    speechstart: Event;
    start: Event;
  }
  
  interface SpeechGrammar {
    src: string;
    weight: number;
  }
  
  declare var SpeechGrammar: {
    prototype: SpeechGrammar;
    new (): SpeechGrammar;
  };
  
  interface SpeechGrammarList {
    readonly length: number;
    addFromString(string: string, weight?: number): void;
    addFromURI(src: string, weight?: number): void;
    item(index: number): SpeechGrammar;
    [index: number]: SpeechGrammar;
  }
  
  declare var SpeechGrammarList: {
    prototype: SpeechGrammarList;
    new (): SpeechGrammarList;
  };
  
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    grammars: SpeechGrammarList;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onerror:
      | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any)
      | null;
    onnomatch:
      | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any)
      | null;
    onresult:
      | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any)
      | null;
    onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    abort(): void;
    start(): void;
    stop(): void;
    addEventListener<K extends keyof SpeechRecognitionEventMap>(
      type: K,
      listener: (this: SpeechRecognition, ev: SpeechRecognitionEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions,
    ): void;
    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ): void;
    removeEventListener<K extends keyof SpeechRecognitionEventMap>(
      type: K,
      listener: (this: SpeechRecognition, ev: SpeechRecognitionEventMap[K]) => any,
      options?: boolean | EventListenerOptions,
    ): void;
    removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions,
    ): void;
  }
  
  declare var SpeechRecognition: {
    prototype: SpeechRecognition;
    new (): SpeechRecognition;
  };
  
  declare var webkitSpeechRecognition: {
    prototype: SpeechRecognition;
    new (): SpeechRecognition;
  };
  
  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: SpeechRecognitionErrorCode;
    readonly message: string;
  }
  
  type SpeechRecognitionErrorCode =
    | 'aborted'
    | 'audio-capture'
    | 'bad-grammar'
    | 'language-not-supported'
    | 'network'
    | 'no-speech'
    | 'not-allowed'
    | 'service-not-allowed';
  
  interface SpeechRecognitionEvent extends Event {
    readonly emma: Document | null;
    readonly interpretation: any;
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }
  
  interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechSynthesisAlternative;
    [index: number]: SpeechSynthesisAlternative;
  }
  
  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }
  
  interface SpeechSynthesisAlternative {
    readonly confidence: number;
    readonly transcript: string;
  }

  interface Window {
    SpeechRecognition: typeof SpeechRecognition,
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

export {};
