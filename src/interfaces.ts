export interface InputJSONXLF {
  sourceLanguage: string;
  resources: {
    ['ng2.template'] : {
      [id: string]: NonTranslatedEntry<string | any>
    }
  }
}

export interface OutputJSONXLF {
  sourceLanguage: string;
  resources: {
    ['ng2.template'] : {
      [id: string]: TranslatedEntry | NonTranslatedEntry<string | any[]>
    }
  }
}

export interface NonTranslatedEntry<T> {
  source: T;
}

export interface TranslatedEntry {
  source: string | any[];
  target: string | any[]; 
}