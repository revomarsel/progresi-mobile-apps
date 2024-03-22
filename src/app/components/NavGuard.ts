import { Injectable } from '@angular/core';
import { NavService } from './NavService';

@Injectable()
export class NavGuardService {

    constructor(public navService: NavService) { }

    canDeactivate(): boolean {
        const isDirty = this.navService.getDirty();
        if (isDirty) {
            if (confirm('Apakah anda yakin ingin meninggalkan halaman ini? Data yang belum disimpan akan hilang.')) return true;
            else return false;
        } else return true;
    }
}