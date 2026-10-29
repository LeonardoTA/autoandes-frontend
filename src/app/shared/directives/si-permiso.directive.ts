import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

@Directive({
  selector: '[siPermiso]',
  standalone: true
})
export class SiPermiso implements OnInit {
  @Input('siPermiso') permiso!: string;

  private auth = inject(AuthService);
  private template = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);

  ngOnInit() {
    if (this.auth.hasPermiso(this.permiso)) {
      this.viewContainer.createEmbeddedView(this.template);
    } else {
      this.viewContainer.clear();
    }
  }
}
