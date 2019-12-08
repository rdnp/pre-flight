import { TestBed, async, inject } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { HttpClientModule, HttpClient } from '@angular/common/http';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports: [
        HttpClientModule,
      ]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'de-rdnp-preflight-flightplanner-webui'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('de-rdnp-preflight-flightplanner-webui');
  });

  it('should render title in a h1 tag', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Welcome to de-rdnp-preflight-flightplanner-webui!');
  });

  it('should display the test data from a test case', inject([HttpClient], (client: HttpClient) => {
    async(async () => {
      // client.post('http://localhost:8080/setTestCase1', '').subscribe((result: Object) => {
      //   console.log(result);
      // });

      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.debugElement.componentInstance;
      const compiled = fixture.debugElement.nativeElement;

      console.log(compiled.querySelector('ul').textContent);
      console.log(app);

      await fixture.whenStable();
      fixture.detectChanges();

      expect(app.flights).toBeTruthy();
      expect(app.flights.length).toBeGreaterThan(0);
      expect(compiled.querySelector('ul').textContent).toContain('EDDB');
      expect(compiled.querySelector('ul').textContent).toContain('EDDL');
      expect(compiled.querySelector('ul').textContent).toContain('EDTY');
    })
  }));

});
