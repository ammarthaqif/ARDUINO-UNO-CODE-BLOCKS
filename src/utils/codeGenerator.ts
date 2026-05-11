import { BlockInstance } from '../types';

export function generateArduinoCode(blocks: BlockInstance[]): string {
  let setupLines: string[] = [];
  let variableLines = new Set<string>();

  const processBlock = (block: BlockInstance, indent: string = '  '): string => {
    switch (block.type) {
      case 'led_on':
        const pinOn = block.parameters.pin || 13;
        setupLines.push(`  pinMode(${pinOn}, OUTPUT);`);
        return `${indent}digitalWrite(${pinOn}, HIGH); // Turn the light ON`;
      
      case 'led_off':
        const pinOff = block.parameters.pin || 13;
        setupLines.push(`  pinMode(${pinOff}, OUTPUT);`);
        return `${indent}digitalWrite(${pinOff}, LOW); // Turn the light OFF`;

      case 'led_brightness':
        const pinPWM = block.parameters.pin || 11;
        const val = block.parameters.value || 128;
        setupLines.push(`  pinMode(${pinPWM}, OUTPUT);`);
        return `${indent}analogWrite(${pinPWM}, ${val}); // Set brightness`;
      
      case 'delay':
        const ms = block.parameters.ms || 1000;
        return `${indent}delay(${ms}); // Wait for a bit`;
      
      case 'repeat':
        const repeatCode = (block.children || [])
          .map(child => processBlock(child, indent + '  '))
          .join('\n');
        return `${indent}while(true) {\n${repeatCode}\n${indent}}`;

      case 'if_pressed':
        const ifPin = block.parameters.pin || 2;
        setupLines.push(`  pinMode(${ifPin}, INPUT_PULLUP);`);
        const ifCode = (block.children || [])
          .map(child => processBlock(child, indent + '  '))
          .join('\n');
        return `${indent}if (digitalRead(${ifPin}) == LOW) {\n${ifCode}\n${indent}}`;

      case 'if_else_pressed':
        const ifElsePin = block.parameters.pin || 2;
        setupLines.push(`  pinMode(${ifElsePin}, INPUT_PULLUP);`);
        const ifBranches = (block.children || [])
          .map(child => processBlock(child, indent + '  '))
          .join('\n');
        const elseBranches = (block.elseChildren || [])
          .map(child => processBlock(child, indent + '  '))
          .join('\n');
        return `${indent}if (digitalRead(${ifElsePin}) == LOW) {\n${ifBranches}\n${indent}} else {\n${elseBranches}\n${indent}}`;

      case 'var_get':
        const gName = block.parameters.name || "score";
        return `${indent}${gName}; // Use variable value`;

      case 'var_set':
        const name = block.parameters.name || "score";
        const v = block.parameters.value ?? 0;
        variableLines.add(`int ${name} = 0;`);
        return `${indent}${name} = ${v};`;

      case 'analog_read':
        const aPin = block.parameters.pin || 'A0';
        const aVar = block.parameters.variable || 'sensorValue';
        variableLines.add(`int ${aVar} = 0;`);
        return `${indent}${aVar} = analogRead(${aPin});`;

      case 'map_value':
        const inputVar = block.parameters.input || 'sensorValue';
        const targetVar = block.parameters.output || 'brightness';
        const inMin = block.parameters.inMin || 0;
        const inMax = block.parameters.inMax || 1023;
        const outMin = block.parameters.outMin || 0;
        const outMax = block.parameters.outMax || 255;
        variableLines.add(`int ${targetVar} = 0;`);
        return `${indent}${targetVar} = map(${inputVar}, ${inMin}, ${inMax}, ${outMin}, ${outMax});`;

      case 'serial_say':
        const msg = block.parameters.message || "Hello Sparky!";
        setupLines.push(`  Serial.begin(9600);`);
        return `${indent}Serial.println("${msg}");`;

      case 'sound_beep':
        const beepPin = block.parameters.pin || 9;
        setupLines.push(`  pinMode(${beepPin}, OUTPUT);`);
        return `${indent}tone(${beepPin}, 1000, 200); // Beep!`;

      case 'sound_tone':
        const tonePin = block.parameters.pin || 9;
        const freq = block.parameters.frequency || 440;
        setupLines.push(`  pinMode(${tonePin}, OUTPUT);`);
        return `${indent}tone(${tonePin}, ${freq}); // Play note`;

      case 'motor_run':
        const mPin = block.parameters.pin || 5;
        const speed = block.parameters.speed || 255;
        setupLines.push(`  pinMode(${mPin}, OUTPUT);`);
        return `${indent}analogWrite(${mPin}, ${speed}); // Motor Go!`;

      case 'motor_stop':
        const msPin = block.parameters.pin || 5;
        setupLines.push(`  pinMode(${msPin}, OUTPUT);`);
        return `${indent}digitalWrite(${msPin}, LOW); // Motor Stop`;

      case 'servo_angle':
        const sPin = block.parameters.pin || 10;
        const angle = block.parameters.angle || 90;
        variableLines.add(`#include <Servo.h>\nServo myServo;`);
        setupLines.push(`  myServo.attach(${sPin});`);
        return `${indent}myServo.write(${angle}); // Servo move`;

      case 'display_clear':
        variableLines.add(`#include <Wire.h>\n#include <Adafruit_GFX.h>\n#include <Adafruit_SSD1306.h>\nAdafruit_SSD1306 display(128, 64, &Wire, -1);`);
        setupLines.push(`  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);\n  display.clearDisplay();`);
        return `${indent}display.clearDisplay();\n${indent}display.display();`;

      case 'display_show':
        const txt = block.parameters.text || "Hello!";
        variableLines.add(`#include <Wire.h>\n#include <Adafruit_GFX.h>\n#include <Adafruit_SSD1306.h>\nAdafruit_SSD1306 display(128, 64, &Wire, -1);`);
        setupLines.push(`  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);\n  display.clearDisplay();`);
        return `${indent}display.setTextSize(1);\n${indent}display.setTextColor(WHITE);\n${indent}display.setCursor(0,0);\n${indent}display.println("${txt}");\n${indent}display.display();`;

      case 'sensor_light':
        const lPin = block.parameters.pin || 'A0';
        return `${indent}analogRead(${lPin}); // Reading light level`;
      
      default:
        return `${indent}// Unknown block: ${block.type}`;
    }
  };

  const code = blocks.map(b => processBlock(b)).join('\n');

  // Deduplicate setup lines
  const uniqueSetup = Array.from(new Set(setupLines)).join('\n');
  const vars = Array.from(variableLines).join('\n');

  return `/**
 * Generated by MakerBlock 🚀
 * Have fun creating!
 */

${vars}

void setup() {
${uniqueSetup}
}

void loop() {
${code}
}
`;
}
