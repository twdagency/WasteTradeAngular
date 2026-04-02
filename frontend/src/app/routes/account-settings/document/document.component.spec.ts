import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { CompanyDocumentType } from 'app/models';
import { IDocument } from 'app/models/listing-material-detail.model';
import { AnalyticsService } from 'app/services/analytics.service';
import { AuthService } from 'app/services/auth.service';
import { DocumentComponent } from './document.component';

function baseDoc(overrides: Partial<IDocument> = {}): IDocument {
  return {
    createdAt: '',
    updatedAt: '',
    id: 1,
    documentType: CompanyDocumentType.EnvironmentalPermit,
    documentUrl: 'https://bucket.example.com/path/file.pdf',
    listingId: 0,
    uploadedByUserId: 1,
    reviewedByUserId: null,
    documentName: 'file.pdf',
    status: 'pending',
    companyId: 1,
    ...overrides,
  };
}

describe('DocumentComponent', () => {
  let component: DocumentComponent;
  let fixture: ComponentFixture<DocumentComponent>;
  const user$ = new BehaviorSubject<unknown>(null);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentComponent, TranslateModule.forRoot()],
      providers: [
        { provide: AuthService, useValue: { user$: user$.asObservable() } },
        { provide: MatDialog, useValue: { open: jasmine.createSpy('open') } },
        { provide: AnalyticsService, useValue: { trackEvent: jasmine.createSpy('trackEvent') } },
      ],
    }).compileComponents();

    user$.next(null);
    fixture = TestBed.createComponent(DocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('otherDocumentDescription', () => {
    it('returns custom documentType for other permits', () => {
      const item = baseDoc({
        documentType: 'test description' as any,
        documentName: 'test description',
        documentUrl: 'https://x.com/1775140643403_.file.pdf',
      });
      expect(component.otherDocumentDescription(item)).toBe('test description');
    });
  });

  describe('showAllTypeDocument', () => {
    it('maps known permit types and other to Other Document label', () => {
      const docs: IDocument[] = [
        baseDoc({ id: 1, documentType: CompanyDocumentType.EnvironmentalPermit }),
        baseDoc({ id: 2, documentType: CompanyDocumentType.WasteExemption }),
        baseDoc({ id: 3, documentType: 'custom text' as any }),
      ];
      component.showAllTypeDocument(docs);
      expect(component.documentTypeUploaded).toContain('Environmental Permit');
      expect(component.documentTypeUploaded).toContain('Waste Exemption');
      expect(component.documentTypeUploaded).toContain('Other Document');
    });
  });
});
