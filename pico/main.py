"""
Description: Commande d'un bandeau lumineux de type WS2812 depuis un raspberry pico.
Le signal envoyé au bandeau est configuré par défaut sur le GPIO0 du pico.
"""
import re

from bt_controller.module import BtController 
from led_controller import LedController


class BtControllerLed(BtController):
    
    def __init__(self, led_controller, name= None):
        super().__init__(name)
        self._led_controller = led_controller
        self._led_state = True
        #self._led_controller.set_random()
        self._player_positions = {"rouge": 0, "bleu": 0}  # Position de départ de chaque joueur
        # Assurer que 'num_leds' existe ou est défini de manière appropriée dans LedController
        if hasattr(self._led_controller, "num_leds"):
            self._led_count = self._led_controller.num_leds  # Nombre de LEDs sur le bandeau
        else:
            # Si le nombre de LEDs n'est pas défini dans LedController, tu peux fixer une valeur ou utiliser une autre méthode pour obtenir cette info
            self._led_count = 30  # Exemple de valeur, à ajuster en fonction de ta configuration

        self._game_won = False  # Indicateur de victoire
        self._winner = None  # Gagnant de la partie (rouge ou bleu)
    
    def on_rx(self, data):
        data = data.decode('utf-8')
        print(f"Data received (UTF-8): {data}")
        
        if re.search("^reset", data):
            print("Recommencer")
            led_controller.init_race()
            
        if self._led_controller.winner:
            print(f"Partie terminée. Gagnant: {self._led_controller.winner}")
            return

        if re.search("^rouge", data):
            print("Tour du joueur rouge")
            result = self._led_controller.run_race_step("rouge")
            if result:
                print(f" Le joueur {result} a gagné !")

        elif re.search("^bleu", data):
            print("Tour du joueur bleu")
            result = self._led_controller.run_race_step("bleu")
            if result:
                print(f" Le joueur {result} a gagné !")

if __name__ == "__main__":
    led_controller = LedController()
    led_controller.init_race()
    #led_controller.set_red_green_blue_loop()
    #led_controller.set_led_color((255, 0, 0))
    #led_controller.set_random()
    #led_controller.ukraine_flag()
    btController = BtControllerLed(led_controller, "Igris")
    btController.start()


