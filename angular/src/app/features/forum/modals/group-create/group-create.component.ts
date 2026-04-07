import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PinService } from '@gofish/shared/services/pin.service';
import { UrlService } from '@gofish/features/map/services/url.service';
import { AsyncButtonComponent } from '@gofish/shared/components/async-button/async-button.component';
import { BusyState } from '@gofish/shared/core/busy-state';
import { GroupsService } from '@gofish/shared/services/groups.service';
import { toast } from 'ngx-sonner';
import { BodyLengthConstraints } from '@gofish/shared/constants';

@Component({
  selector: 'app-group-create',
  imports: [CommonModule, ReactiveFormsModule, AsyncButtonComponent],
  templateUrl: './group-create.component.html',
  styleUrl: './group-create.component.css',
})
export class GroupCreateComponent {
  private readonly groupsService = inject(GroupsService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  protected readonly BodyLengthConstraints = BodyLengthConstraints;
  busyState: BusyState = new BusyState();

  groupName: string = '';
  body: string = '';
  image: File | null = null;

  errorMessage: string = '';

  form = this.fb.group({
    body: ['', [Validators.required, Validators.minLength(BodyLengthConstraints.MIN), Validators.maxLength(BodyLengthConstraints.MAX)]],
    groupName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    imageUrl: [null, [Validators.required]]
  });

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

    if (!allowedTypes.includes(file.type)) {
      alert('Only PNG or JPEG or JPG images are allowed');
      return;
    }

    this.image = file;
  }


  onCancel(): void {
    toast.info('You cancel the creation');
    this.router.navigate(['/forum/my-groups']);
  }

  onPublish(): void {
    this.form.markAllAsTouched();
    this.errorMessage = '';

    if (!this.image) {
      this.errorMessage = 'Please upload an image.';
      return;
    }

    this.busyState.setBusy(true);

    const formData = new FormData();
    formData.append('Image', this.image);
    //formData.append('image', this.image);
    formData.append('Name', this.form.value.groupName!);
    formData.append('Description', this.form.value.body!);


    const toastId = toast.loading('Creating your group!');
    console.log(formData);
    this.groupsService.createGroup(formData).subscribe({
      next: () => {
        this.busyState.setBusy(false);
        toast.dismiss(toastId);
        toast.success('Group created successfully.');
        this.router.navigate(['/forum/my-groups']);
      },
      error: (err) => {
        this.busyState.setBusy(false);
        toast.dismiss(toastId);
        this.errorMessage = 'Failed to create group. Please try again.';
        toast.error(this.errorMessage);
        console.log(err);
      }
    });
  }
}
