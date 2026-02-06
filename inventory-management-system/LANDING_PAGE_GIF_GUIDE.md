# Landing Page GIF Guide

## Adding a GIF to the Landing Page

The landing page has been enhanced with Framer Motion animations and includes a placeholder for a hero GIF.

### Steps to Add Your GIF:

1. **Place your GIF file** in the `public` folder:
   ```
   public/landing-hero.gif
   ```

2. **Uncomment the Image component** in `src/app/page.tsx`:
   
   Find this section (around line 200):
   ```tsx
   {/* Uncomment and use this when you have a GIF */}
   {/* <Image
       src="/landing-hero.gif"
       alt="Inventory Management System"
       fill
       className="object-cover"
       priority
       unoptimized
   /> */}
   ```

   And uncomment it:
   ```tsx
   <Image
       src="/landing-hero.gif"
       alt="Inventory Management System"
       fill
       className="object-cover"
       priority
       unoptimized
   />
   ```

3. **Remove or hide the placeholder**:
   
   You can remove or comment out the placeholder div that shows "Add your inventory management GIF here".

### Recommended GIF Specifications:

- **Format**: GIF (animated)
- **Size**: Recommended 800x600px or 1200x900px
- **File Size**: Try to keep under 5MB for better performance
- **Content**: Showcase your inventory management system features, dashboard, or product workflow

### Alternative: Use a Video

If you prefer a video instead of a GIF:

1. Place your video file in `public/landing-hero.mp4`
2. Replace the Image component with:
   ```tsx
   <video
       autoPlay
       loop
       muted
       playsInline
       className="w-full h-full object-cover"
   >
       <source src="/landing-hero.mp4" type="video/mp4" />
   </video>
   ```

### Current Features:

✅ Framer Motion animations throughout
✅ Smooth scroll animations
✅ Hover effects on interactive elements
✅ Gradient backgrounds
✅ Floating cards with animations
✅ Responsive design
✅ Dark mode support

Enjoy your enhanced landing page! 🚀
