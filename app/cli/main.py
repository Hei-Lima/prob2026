from libs import maquina

def main():
    credits = 0
    maq = maquina.Maquina(None)
    for i in range(10000):
        credits -= 1
        result = maq.rodar()
        print(str(result) + f"\n Credits: {credits}")
        payout = result["P"]
        credits += payout

if __name__ == "__main__":
    main()