/*
 * SOLIDARITY PLATFORM - SYSTEM CONFIG JAVA APP
 * =============================================
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.io.*;
import java.nio.file.*;
import java.security.*;

public class SolidaritySystemConfigApp extends JFrame {
    // System config state
    private double baseRatio = 1.618;
    private double bridgingBaseline = 0.618;
    private double globalSafetyLevel = 0.618;
    private boolean emergencyProtocols = true;
    private Map<String, Boolean> subsystems = new HashMap<>();
    private Map<String, Double> componentSafety = new HashMap<>();
    private JTextArea outputArea;
    private JComboBox<String> safetyLevelCombo;
    private JCheckBox aiEnabled, financialEnabled, quantumEnabled, bridgingAnchorEnabled;
    private JButton bridgeSafetyBtn, emergencyBtn, updateConfigBtn, showReportBtn, saveLogBtn, desypherBtn;
    private File logFolder = new File("logs");

    public SolidaritySystemConfigApp() {
        setTitle("Solidarity Platform - System Config");
        setSize(700, 600);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        // Initialize subsystems
        subsystems.put("ai", false);
        subsystems.put("financial", false);
        subsystems.put("quantum", true);
        subsystems.put("bridgingAnchor", true);
        for (String key : subsystems.keySet()) {
            componentSafety.put(key, bridgingBaseline);
        }
        componentSafety.put("launcher", bridgingBaseline);
        componentSafety.put("solidarity", bridgingBaseline);

        // UI Components
        outputArea = new JTextArea();
        outputArea.setEditable(false);
        outputArea.setFont(new Font("Consolas", Font.PLAIN, 14));
        JScrollPane scrollPane = new JScrollPane(outputArea);

        JPanel controlPanel = new JPanel();
        controlPanel.setLayout(new GridLayout(0, 2, 10, 10));

        // Safety level selection
        safetyLevelCombo = new JComboBox<>(new String[] {"0.05 (Critical)", "0.15 (Warning)", "0.25 (Caution)", "0.618 (Optimal)", "0.75 (Upper Caution)", "0.85 (Upper Warning)", "0.95 (Critical Upper)"});
        controlPanel.add(new JLabel("Set Safety Level:"));
        controlPanel.add(safetyLevelCombo);

        // Subsystem toggles
        aiEnabled = new JCheckBox("AI Enabled", subsystems.get("ai"));
        financialEnabled = new JCheckBox("Financial Enabled", subsystems.get("financial"));
        quantumEnabled = new JCheckBox("Quantum Enabled", subsystems.get("quantum"));
        bridgingAnchorEnabled = new JCheckBox("Bridging Anchor Enabled", subsystems.get("bridgingAnchor"));
            // Welcome message at the very top
            JLabel welcomeLabel = new JLabel("Welcome to the Solidarity Platform System Config App", SwingConstants.CENTER);
            welcomeLabel.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 18));
            welcomeLabel.setOpaque(true);
            welcomeLabel.setBackground(new Color(235, 255, 235));
            welcomeLabel.setBorder(BorderFactory.createEmptyBorder(8, 0, 8, 0));
            getContentPane().add(welcomeLabel, BorderLayout.PAGE_START);
        controlPanel.add(aiEnabled);
        controlPanel.add(financialEnabled);
        controlPanel.add(quantumEnabled);
        controlPanel.add(bridgingAnchorEnabled);

        // Action buttons
        bridgeSafetyBtn = new JButton("Bridge Safety");
        emergencyBtn = new JButton("Emergency Stabilization");
        updateConfigBtn = new JButton("Update Config");
        showReportBtn = new JButton("Show Config Report");
        saveLogBtn = new JButton("Save Encrypted Log (.chd)");
        desypherBtn = new JButton("Desypher Henry 7 Waltz Log");
        controlPanel.add(bridgeSafetyBtn);
        controlPanel.add(emergencyBtn);
        controlPanel.add(updateConfigBtn);
        controlPanel.add(showReportBtn);
        controlPanel.add(saveLogBtn);
        controlPanel.add(desypherBtn);

        add(controlPanel, BorderLayout.NORTH);
        add(scrollPane, BorderLayout.CENTER);

        // Button actions
        bridgeSafetyBtn.addActionListener(e -> bridgeSafety());
        emergencyBtn.addActionListener(e -> emergencyStabilization());
        updateConfigBtn.addActionListener(e -> updateConfig());
        showReportBtn.addActionListener(e -> printConfigReport());
        saveLogBtn.addActionListener(e -> saveEncryptedLog());
        desypherBtn.addActionListener(e -> desypherLog());

        printConfigReport();
    }

    private void bridgeSafety() {
        double[] levels = {0.05, 0.15, 0.25, 0.618, 0.75, 0.85, 0.95};
        int idx = safetyLevelCombo.getSelectedIndex();
        globalSafetyLevel = levels[idx];
        for (String key : componentSafety.keySet()) {
            componentSafety.put(key, globalSafetyLevel);
        }
        log("\n🔄 Bridging all systems to safety level: " + String.format("%.3f", globalSafetyLevel));
        log("✅ Safety levels bridged");
        printConfigReport();
    }

    private void emergencyStabilization() {
        globalSafetyLevel = bridgingBaseline;
        for (String key : componentSafety.keySet()) {
            componentSafety.put(key, bridgingBaseline);
        }
        emergencyProtocols = true;
        log("\n🚨 SYSTEM-WIDE EMERGENCY STABILIZATION");
        log("🌉 All systems restored to Base Ratio (φ = 0.618)");
        printConfigReport();
    }

    private void updateConfig() {
        subsystems.put("ai", aiEnabled.isSelected());
        subsystems.put("financial", financialEnabled.isSelected());
        subsystems.put("quantum", quantumEnabled.isSelected());
        subsystems.put("bridgingAnchor", bridgingAnchorEnabled.isSelected());
        log("\n✅ Configuration updated: ai");
        log("✅ Configuration updated: financial");
        printConfigReport();
    }

    private void printConfigReport() {
        StringBuilder sb = new StringBuilder();
        sb.append("\n⚙️ UNIFIED SYSTEM CONFIGURATION REPORT\n");
        sb.append("=".repeat(60) + "\n");
        sb.append("Version: 1.0.0\n");
        sb.append("Timestamp: " + LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) + "\n");
        sb.append("🌉 Base Ratio: " + baseRatio + "\n");
        sb.append("⚓ Bridging Baseline: " + bridgingBaseline + "\n");
        sb.append("🛡️ Global Safety Level: " + String.format("%.3f", globalSafetyLevel) + "\n\n");
        sb.append("🔧 SUBSYSTEMS:\n");
        for (String key : subsystems.keySet()) {
            sb.append("  " + key + ": " + (subsystems.get(key) ? "✅ ENABLED" : "❌ DISABLED") + "\n");
        }
        sb.append("\n🛡️ COMPONENT SAFETY LEVELS:\n");
        for (String key : componentSafety.keySet()) {
            sb.append("  " + key + ": " + String.format("%.3f", componentSafety.get(key)) + "\n");
        }
        sb.append("\n");
        if (!subsystems.get("financial")) {
            sb.append("⚠️ WARNINGS:\n  Financial test mode is DISABLED - live transactions possible\n");
        }
        if (!subsystems.get("ai")) {
            sb.append("  AI integration is disabled\n");
        }
        sb.append("\n🚨 Emergency Protocols: " + (emergencyProtocols ? "ACTIVE" : "INACTIVE") + "\n");
        sb.append("=".repeat(60) + "\n");
        outputArea.setText(sb.toString());
    }

    private void log(String msg) {
        outputArea.append(msg + "\n");
    }

    // Save encrypted log file in .chd format
    private void saveEncryptedLog() {
        try {
            if (!logFolder.exists()) logFolder.mkdirs();
            String logText = outputArea.getText();
            byte[] encrypted = henry7Encrypt(logText.getBytes("UTF-8"));
            String fileName = "log_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".chd";
            File logFile = new File(logFolder, fileName);
            Files.write(logFile.toPath(), encrypted);
            log("\n✅ Log saved (encrypted): " + logFile.getAbsolutePath());
        } catch (Exception ex) {
            log("❌ Error saving log: " + ex.getMessage());
        }
    }

    // Desypher Henry 7 Waltz encrypted log
    private void desypherLog() {
        JFileChooser chooser = new JFileChooser(logFolder);
        chooser.setFileFilter(new javax.swing.filechooser.FileNameExtensionFilter("Henry 7 Waltz Log (.chd)", "chd"));
        int result = chooser.showOpenDialog(this);
        if (result == JFileChooser.APPROVE_OPTION) {
            File file = chooser.getSelectedFile();
            try {
                byte[] encrypted = Files.readAllBytes(file.toPath());
                byte[] decrypted = henry7Decrypt(encrypted);
                String logText = new String(decrypted, "UTF-8");
                outputArea.setText(logText);
                log("\n✅ Log desyphered: " + file.getName());
            } catch (Exception ex) {
                log("❌ Error desyphering log: " + ex.getMessage());
            }
        }
    }

    // Henry 7 Waltz encryption (simple reversible obfuscation for demo)
    private byte[] henry7Encrypt(byte[] data) throws Exception {
        // XOR with Henry sequence and base ratio
        byte[] key = getHenry7Key(data.length);
        byte[] out = new byte[data.length];
        for (int i = 0; i < data.length; i++) {
            out[i] = (byte)(data[i] ^ key[i]);
        }
        return out;
    }

    // Henry 7 Waltz decryption
    private byte[] henry7Decrypt(byte[] data) throws Exception {
        // XOR with Henry sequence and base ratio (same as encrypt)
        return henry7Encrypt(data);
    }

    // Generate Henry 7 Waltz key sequence
    private byte[] getHenry7Key(int len) {
        int[] henrySeq = {7, 14, 49};
        double phi = baseRatio;
        byte[] key = new byte[len];
        for (int i = 0; i < len; i++) {
            int h = henrySeq[i % henrySeq.length];
            key[i] = (byte)((h * phi * (i+1)) % 256);
        }
        return key;
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            SolidaritySystemConfigApp app = new SolidaritySystemConfigApp();
            app.setVisible(true);
        });
    }
}
