# Wedding Website Media Files

## Directory Structure

### Images
- `home/` - Images specifically for the home page timeline/story section
- `gallery/` - Main photo gallery images
- `couple/` - Couple/engagement photos
- `venue/` - Venue and location photos

### Audio
- Background music and audio files

## Usage in Code

Reference these files in your React components like:

```jsx
// For images
<img src="/images/home/timeline-1.jpg" alt="Description" />

// Using Next.js Image component (recommended)
import Image from 'next/image'
<Image src="/images/couple/engagement.jpg" width={800} height={600} alt="Engagement" />

// For audio
<audio src="/audio/background-music.mp3" />
```

## File Naming Convention
- Use lowercase letters and hyphens
- Be descriptive: `couple-engagement.jpg`, `venue-exterior.jpg`
- Keep file sizes optimized for web