from PIL import Image

def process_logo():
    img = Image.open('src/assets/logo.jpeg').convert('RGBA')
    width, height = img.size
    
    new_img = Image.new('RGBA', img.size)
    pixels = new_img.load()
    orig_pixels = img.load()
    
    min_x, max_x = width, 0
    min_y, max_y = height, 0
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = orig_pixels[x, y]
            
            # Detect background: mostly white or very light gray
            if r > 240 and g > 240 and b > 240:
                pixels[x, y] = (255, 255, 255, 0)
            # Detect the red M
            elif r > 120 and g < 100 and b < 100:
                pixels[x, y] = (r, g, b, a)
                min_x, max_x = min(min_x, x), max(max_x, x)
                min_y, max_y = min(min_y, y), max(max_y, y)
            # Detect black/dark text
            elif r < 120 and g < 120 and b < 120:
                pixels[x, y] = (255, 255, 255, a)
                min_x, max_x = min(min_x, x), max(max_x, x)
                min_y, max_y = min(min_y, y), max(max_y, y)
            else:
                # Anti-aliasing edges
                if r > b + 20 and r > g + 20:
                    pixels[x, y] = (239, 68, 68, max(0, min(255, 255 - int((g+b)/2))))
                else:
                    brightness = (r + g + b) // 3
                    if brightness < 240:
                        alpha = max(0, min(255, 255 - brightness))
                        pixels[x, y] = (255, 255, 255, alpha)
                        min_x, max_x = min(min_x, x), max(max_x, x)
                        min_y, max_y = min(min_y, y), max(max_y, y)
                    else:
                        pixels[x, y] = (255, 255, 255, 0)
                        
    min_x = max(0, min_x - 10)
    max_x = min(width, max_x + 10)
    min_y = max(0, min_y - 10)
    max_y = min(height, max_y + 10)
    
    if max_x > min_x and max_y > min_y:
        cropped = new_img.crop((min_x, min_y, max_x, max_y))
        cropped.save('src/assets/logo-white.png', 'PNG')
    else:
        new_img.save('src/assets/logo-white.png', 'PNG')

if __name__ == '__main__':
    process_logo()
