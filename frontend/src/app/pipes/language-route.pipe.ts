import { Pipe, PipeTransform } from '@angular/core';
import { addLanguagePrefix } from '../utils/language.utils';

@Pipe({
  name: 'langRoute',
  standalone: true,
})
export class LanguageRoutePipe implements PipeTransform {
  transform(path: string): string {
    return addLanguagePrefix(path);
  }
}
