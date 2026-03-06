# Vault 整合使用範例

## 範例 1：查詢玩家餘額並顯示

在指令中查詢執行者的餘額：

```java
@Override
public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
    if (!(sender instanceof Player player)) {
        sender.sendMessage("此指令只能由玩家執行。");
        return true;
    }

    EconomyManager eco = plugin.getEconomyManager();

    if (!eco.isAvailable()) {
        player.sendMessage(Component.text("經濟系統目前不可用。").color(NamedTextColor.RED));
        return true;
    }

    double balance = eco.getBalance(player);
    player.sendMessage(Component.text(
        String.format("你目前的餘額：%.2f 金幣", balance)
    ).color(NamedTextColor.GOLD));

    return true;
}
```

---

## 範例 2：扣款（含失敗處理）

玩家購買道具時扣除金額：

```java
private void purchaseItem(Player player, double price, ItemStack item) {
    EconomyManager eco = plugin.getEconomyManager();

    // 先確認是否有足夠金額
    if (!eco.has(player, price)) {
        player.sendMessage(Component.text(
            String.format("餘額不足！需要 %.2f 金幣，你只有 %.2f 金幣。",
                price, eco.getBalance(player))
        ).color(NamedTextColor.RED));
        return;
    }

    EconomyResponse resp = eco.withdraw(player, price);

    if (resp.transactionSuccess()) {
        player.getInventory().addItem(item);
        player.sendMessage(Component.text(
            String.format("購買成功！已扣除 %.2f 金幣，剩餘 %.2f 金幣。",
                price, resp.balance)
        ).color(NamedTextColor.GREEN));
    } else {
        player.sendMessage(Component.text(
            "交易失敗：" + resp.errorMessage
        ).color(NamedTextColor.RED));
    }
}
```

---

## 範例 3：存款（玩家完成任務獲得獎勵）

事件觸發後給予玩家獎勵金額：

```java
@EventHandler
public void onQuestComplete(QuestCompleteEvent event) {
    Player player = event.getPlayer();
    double reward = event.getRewardAmount();

    EconomyManager eco = plugin.getEconomyManager();

    if (!eco.isAvailable()) return;

    EconomyResponse resp = eco.deposit(player, reward);

    if (resp.transactionSuccess()) {
        player.sendMessage(Component.text(
            String.format("任務完成！獲得 %.2f 金幣，目前餘額：%.2f 金幣。",
                reward, resp.balance)
        ).color(NamedTextColor.GOLD));
    } else {
        plugin.getLogger().warning(
            String.format("無法發放獎勵給 %s：%s", player.getName(), resp.errorMessage)
        );
    }
}
```

---

## 範例 4：軟依賴降級處理（Vault 非必裝）

插件將 Vault 宣告為 `softdepend` 時，Vault 未安裝的情況下仍可運作，但停用經濟相關功能：

**plugin.yml：**

```yaml
softdepend: [Vault]
```

**主類 onEnable：**

```java
@Override
public void onEnable() {
    economyManager = new EconomyManager(this);
    boolean vaultLoaded = economyManager.setupEconomy();

    if (!vaultLoaded) {
        getLogger().warning("Vault 未安裝，經濟相關功能（商店、獎勵）將停用。");
        // 不停用插件，只停用需要 Vault 的子功能
        featureShop.setEnabled(false);
        featureReward.setEnabled(false);
    }
}
```

**在需要 Vault 的功能中加上守衛：**

```java
public void openShop(Player player) {
    if (!plugin.getEconomyManager().isAvailable()) {
        player.sendMessage(Component.text("此伺服器未安裝經濟插件，無法使用商店。")
            .color(NamedTextColor.GRAY));
        return;
    }

    // 正常開啟商店邏輯...
}
```
