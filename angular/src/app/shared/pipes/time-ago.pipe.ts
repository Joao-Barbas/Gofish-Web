import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo'
})
export class TimeAgoPipe implements PipeTransform {

  transform(value: any): string {
    if (!value) return '';

    const now = new Date();
    const date = new Date(value);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) {
      return `há ${seconds} segundos`;
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `há ${hours} hora${hours > 1 ? 's' : ''}`;
    }

    const days = Math.floor(hours / 24);
    if (days < 30) {
      return `há ${days} dia${days > 1 ? 's' : ''}`;
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
      return `há ${months} mês${months > 1 ? 'es' : ''}`;
    }

    const years = Math.floor(months / 12);
    return `há ${years} ano${years > 1 ? 's' : ''}`;
  }
}

