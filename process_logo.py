from PIL import Image

def process_logo():
    img = Image.open('src/assets/logo.jpeg').convert('RGBA')
    width, height = img.size
    
    new_img = Image.new('RGBA', img.size)
    pixels = new_img.load()
    orig_pixels = img.load()
    
    red_min_x, red_max_x = width, 0
    red_min_y, red_max_y = height, 0
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = orig_pixels[x, y]
            if r > 150 and g < 100 and b < 100:
                red_min_x = min(red_min_x, x)
                red_max_x = max(red_max_x, x)
                red_min_y = min(red_min_y, y)
                red_max_y = max(red_max_y, y)
                
    red_min_x -= 2
    red_max_x += 2
    red_min_y -= 2
    red_max_y += 2

    content_min_x, content_max_x = width, 0
    content_min_y, content_max_y = height, 0

    for y in range(height):
        for x in range(width):
            r, g, b, a = orig_pixels[x, y]
            
            in_red_box = (red_min_x <= x <= red_max_x) and (red_min_y <= y <= red_max_y)
            
            if in_red_box:
                pixels[x, y] = orig_pixels[x, y]
                content_min_x = min(content_min_x, x)
                content_max_x = max(content_max_x, x)
                content_min_y = min(content_min_y, y)
                content_max_y = max(content_max_y, y)
            else:
                if r > 230 and g > 230 and b > 230:
                    pixels[x, y] = (255, 255, 255, 0)
                elif r < 120 and g < 120 and b < 120:
                    pixels[x, y] = (255, 255, 255, a)
                    content_min_x = min(content_min_x, x)
                    content_max_x = max(content_max_x, x)
                    content_min_y = min(content_min_y, y)
                    content_max_y = max(content_max_y, y)
                else:
                    brightness = (r + g + b) // 3
                    if brightness < 230:
                        alpha = max(0, min(255, 255 - brightness))
                        pixels[x, y] = (255, 255, 255, alpha)
                        content_min_x = min(content_min_x, x)
                        content_max_x = max(content_max_x, x)
                        content_min_y = min(content_min_y, y)
                        content_max_y = max(content_max_y, y)
                    else:
                        pixels[x, y] = (255, 255, 255, 0)
                        
    content_min_x = max(0, content_min_x - 10)
    content_max_x = min(width, content_max_x + 10)
    content_min_y = max(0, content_min_y - 10)
    content_max_y = min(height, content_max_y + 10)
    
    if content_max_x > content_min_x and content_max_y > content_min_y:
        cropped = new_img.crop((content_min_x, content_min_y, content_max_x, content_max_y))
        cropped.save('src/assets/logo-white.png', 'PNG')
    else:
        new_img.save('src/assets/logo-white.png', 'PNG')

if __name__ == '__main__':
    process_logo()
