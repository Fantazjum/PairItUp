import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'languageIcons'
})
export class LanguageIconsPipe implements PipeTransform {
  private languageNames: {[languageCode: string]: string} = {
    'de': 'german',
    'en': 'english',
    'pl': 'polish',
  };

  transform(value: string): string {
    return '/assets/flags/' + this.languageNames[value] + '.svg#flag-' + value;
  }

}
