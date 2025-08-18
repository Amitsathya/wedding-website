import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestStyles() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-serif text-foreground">Style Test Page</h1>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-serif text-foreground">Buttons</h2>
          <div className="flex gap-4 flex-wrap">
            <Button>Default Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button size="lg">Large Button</Button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-serif text-foreground">Cards</h2>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Test Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">This is a test card to check if styling is working properly.</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-serif text-foreground">Colors Test</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="h-20 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">Primary</div>
            <div className="h-20 bg-secondary rounded-lg flex items-center justify-center text-secondary-foreground">Secondary</div>
            <div className="h-20 bg-accent rounded-lg flex items-center justify-center text-accent-foreground">Accent</div>
            <div className="h-20 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">Muted</div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-serif text-foreground">Typography</h2>
          <div className="space-y-2">
            <p className="text-foreground">This is regular text (foreground)</p>
            <p className="text-muted-foreground">This is muted text</p>
            <p className="text-primary">This is primary colored text</p>
            <h3 className="text-xl font-serif">This is a serif heading</h3>
          </div>
        </div>
      </div>
    </div>
  );
}