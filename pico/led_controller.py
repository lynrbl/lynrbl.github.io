import array
from machine import Pin
import random
import re
from rp2 import PIO, StateMachine, asm_pio
import time

class LedController:
    """
    Contrôle d'une bandeau lumineux de type WS2812
    """

    BLUE = (0, 87, 183)
    BLACK = (0, 0, 0)
    GREEN = (0, 128, 128)
    MAX_LUMINOSITY_ALLOWED = 3
    RED = (255,0,0)
    YELLOW = (0, 0, 128)

    def __init__(self, num_leds=120):
        self.num_leds = num_leds
        self.pixel_array = array.array("I", [0 for _ in range(num_leds)])

        # Configure the StateMachine with the ws2812 program
        @asm_pio(sideset_init=PIO.OUT_LOW, out_shiftdir=PIO.SHIFT_LEFT,
                 autopull=True, pull_thresh=24)
        def ws2812():
            T1 = 2
            T2 = 5
            T3 = 3
            label("bitloop")
            out(x, 1) .side(0) [T3 - 1]
            jmp(not_x, "do_zero") .side(1) [T1 - 1]
            jmp("bitloop") .side(1) [T2 - 1]
            label("do_zero")
            nop() .side(0) [T2 - 1]

        self.sm = StateMachine(0, ws2812, freq=8000000, sideset_base=Pin(0))
        self.sm.active(1)

    def set_led_color(self, color, count=None):
        """  définit une couleur pour un nombre de LED donné (en partant de la 1ère) """
        print("set_led_color")
        if count is None: count = len(self.pixel_array)
        for ii in range(count):
            self.pixel_array[ii] = (color[1]<<16) + (color[0]<<8) + color[2]

    def set_red_green_blue_loop(self):
        """ défilement progressif en rouge, vers puis bleu de chaque LED du bandeau """
        print("set_red_green_blue_loop")
        COLORS = [self.RED, self.GREEN, self.BLUE]
        INTERVAL = 0.10 # in second
        for color in COLORS:
            print(f"start new {color}")
            for i in range(self.num_leds):
                self.set_led_color(color, i)
                self.update_pixel()
                print(f"updated {color} for {i}", end='\r')
                time.sleep(INTERVAL)

    def set_random(self):
        """ couleur aléatoire pour l'ensemble des LED du bandeau """
        print("set_random")
        self.set_led_color((random.randrange(255), random.randrange(255), random.randrange(255)))
        self.update_pixel()

    def ukraine_flag(self):
        """ drapeau ukrainien """
        print("ukraine_flag")
        count = len(self.pixel_array)
        blue_count = count // 2
        for ii in range(blue_count):
            self.pixel_array[ii] = (self.BLUE[1] << 16) + (self.BLUE[0] << 8) + self.BLUE[2]
        for ii in range(blue_count, count):
            self.pixel_array[ii] = (self.YELLOW[1] << 16) + (self.YELLOW[0] << 8) + self.YELLOW[2]
        self.update_pixel()

    def update_pixel(self, brightness=None):
        """ conversion dans le format de sortie puis envoi du tableau des couleurs vers le bandeau """
        print("update_pixel")
        if brightness is None: brightness = self.MAX_LUMINOSITY_ALLOWED
        dimmer_array = array.array("I", [0 for _ in range(self.num_leds)])
        for ii, cc in enumerate(self.pixel_array):
            r = int(((cc >> 8) & 0xFF) * brightness)
            g = int(((cc >> 16) & 0xFF) * brightness)
            b = int((cc & 0xFF) * brightness)
            dimmer_array[ii] = (g << 16) + (r << 8) + b
        self.sm.put(dimmer_array, 8)
        
    def init_race(self, players=("rouge", "bleu")):
        """Initialise une course LED avec les joueurs donnés"""
        self.player_positions = {player: 0 for player in players}
        self.winner = None
        self.player_colors = {
            "rouge": self.RED,
            "bleu": self.BLUE
        }
        self.set_led_color(self.BLACK)  # éteint tout
        self.update_pixel()

    def run_race_step(self, player):
        """Fait avancer un joueur d'une LED, retourne True si victoire"""
        if self.winner is not None:
            return self.winner

        current = self.player_positions.get(player, 0)
        next_pos = current + 1
        self.player_positions[player] = next_pos

        # === 1. Gérer LED quittée ===
        still_players_on_current = any(
            pos == current for p, pos in self.player_positions.items() if p != player
        )
        if not still_players_on_current:
            self.pixel_array[current] = (self.BLACK[1] << 16) + (self.BLACK[0] << 8) + self.BLACK[2]
        else:
            remaining_color = (0, 0, 0)
            for p, pos in self.player_positions.items():
                if p != player and pos == current:
                    c = self.player_colors.get(p, self.GREEN)
                    remaining_color = (
                        min(255, remaining_color[0] + c[0]),
                        min(255, remaining_color[1] + c[1]),
                        min(255, remaining_color[2] + c[2])
                    )
            self.pixel_array[current] = (remaining_color[1] << 16) + (remaining_color[0] << 8) + remaining_color[2]

        # === 2. Gérer LED d'arrivée ===
        color = self.player_colors.get(player, self.GREEN)

        existing_color_int = self.pixel_array[next_pos]
        existing_r = (existing_color_int >> 8) & 0xFF
        existing_g = (existing_color_int >> 16) & 0xFF
        existing_b = existing_color_int & 0xFF

        new_r = min(255, existing_r + color[0])
        new_g = min(255, existing_g + color[1])
        new_b = min(255, existing_b + color[2])

        self.pixel_array[next_pos] = (new_g << 16) + (new_r << 8) + new_b
        self.update_pixel()

        # === 3. Gagné ?
        if next_pos >= self.num_leds - 1:
            self.winner = player
            self.set_all_leds_color(color)
            return player

        return None

    def set_all_leds_color(self, color):
        """Allume toutes les LEDs avec la couleur donnée"""
        print(f"set_all_leds_color: {color}")
        for i in range(self.num_leds):
            self.pixel_array[i] = (color[1]<<16) + (color[0]<<8) + color[2]
        self.update_pixel()


